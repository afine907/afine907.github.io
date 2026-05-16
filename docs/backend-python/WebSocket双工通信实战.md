---
sidebar_position: 10
title: WebSocket 双工通信实战
slug: websocket-duplex-communication
---

# WebSocket 双工通信实战

Agent 的实时通信有两个主流选择：SSE（Server-Sent Events）和 WebSocket。SSE 简单够用，但只支持服务器到客户端的单向推送。当 Agent 需要从客户端获取实时输入（工具调用审批、多轮对话确认、文件上传），WebSocket 的双工通信能力就变得不可替代。

## SSE vs WebSocket：如何选择

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 服务端 → 客户端 | 双向 |
| 协议 | HTTP | ws:// / wss:// |
| 自动重连 | 内置（EventSource） | 需手动实现 |
| 传输格式 | 纯文本（text/event-stream） | 二进制 / 文本 |
| 连接数限制 | 浏览器 6 个/域名 | 无限制 |
| 复杂度 | 低 | 中 |

**决策树**：
- 只推送 LLM Token 流 → SSE
- 需要推送 LLM Token + 接收用户审批 → WebSocket
- 需要传输二进制数据（音频、文件） → WebSocket
- 需要大量并发连接 → WebSocket

## FastAPI WebSocket 基础

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@app.websocket("/ws/chat/{session_id}")
async def chat_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            # 处理并响应
            await websocket.send_json({
                "type": "message",
                "content": f"Echo: {data}",
            })
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
```

## Agent 场景的 WebSocket 消息协议

定义统一的消息格式，让前后端按同一套协议通信：

```python
from enum import Enum
from pydantic import BaseModel
from typing import Any


class MessageType(str, Enum):
    # 客户端 → 服务端
    USER_MESSAGE = "user.message"
    TOOL_APPROVAL = "tool.approval"
    TOOL_REJECTION = "tool.rejection"
    CANCEL_REQUEST = "cancel.request"

    # 服务端 → 客户端
    AGENT_THINKING = "agent.thinking"
    TOKEN_STREAM = "token.stream"
    TOOL_REQUEST = "tool.request"
    TOOL_RESULT = "tool.result"
    AGENT_COMPLETED = "agent.completed"
    AGENT_ERROR = "agent.error"


class WSMessage(BaseModel):
    type: MessageType
    session_id: str
    payload: dict[str, Any]
    timestamp: float | None = None
```

## 连接管理

Agent 系统需要管理大量 WebSocket 连接，支持广播和定向推送：

```python
import asyncio
from typing import Any


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = set()
            self.active_connections[session_id].add(websocket)

    async def disconnect(self, session_id: str, websocket: WebSocket):
        async with self._lock:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def send_to_session(self, session_id: str, message: dict[str, Any]):
        """向某个会话的所有连接发送消息"""
        async with self._lock:
            connections = self.active_connections.get(session_id, set())
            disconnected = set()
            for ws in connections:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.add(ws)
            connections -= disconnected

    async def broadcast(self, message: dict[str, Any]):
        """向所有活跃连接广播"""
        async with self._lock:
            for session_id, connections in self.active_connections.items():
                for ws in connections:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass


manager = ConnectionManager()
```

## 完整 Agent WebSocket Handler

```python
@app.websocket("/ws/agent/{session_id}")
async def agent_websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)

    try:
        while True:
            raw = await websocket.receive_json()
            msg = WSMessage(**raw)

            if msg.type == MessageType.USER_MESSAGE:
                # 启动 Agent 执行（异步，不阻塞 WebSocket 循环）
                asyncio.create_task(
                    run_agent_with_ws(session_id, msg.payload["content"])
                )

            elif msg.type == MessageType.TOOL_APPROVAL:
                # 用户批准工具调用
                tool_call_id = msg.payload["tool_call_id"]
                await tool_approval_queue.approve(session_id, tool_call_id)

            elif msg.type == MessageType.CANCEL_REQUEST:
                # 用户取消当前 Agent 执行
                await cancel_agent_task(session_id)
                await manager.send_to_session(session_id, {
                    "type": MessageType.AGENT_COMPLETED,
                    "payload": {"reason": "cancelled"},
                })

    except WebSocketDisconnect:
        await manager.disconnect(session_id, websocket)


async def run_agent_with_ws(session_id: str, user_message: str):
    """Agent 执行过程中通过 WebSocket 实时推送状态"""
    await manager.send_to_session(session_id, {
        "type": MessageType.AGENT_THINKING,
        "payload": {"status": "分析用户输入..."},
    })

    # 流式推送 LLM Token
    async for token in llm_client.stream_completion(user_message):
        await manager.send_to_session(session_id, {
            "type": MessageType.TOKEN_STREAM,
            "payload": {"token": token},
        })

    # 需要用户审批的工具调用
    for tool_call in pending_tool_calls:
        await manager.send_to_session(session_id, {
            "type": MessageType.TOOL_REQUEST,
            "payload": {
                "tool_call_id": tool_call.id,
                "tool_name": tool_call.name,
                "args": tool_call.arguments,
                "risk_level": "high",
            },
        })
        # 等待用户审批（异步）
        approval = await tool_approval_queue.wait_for_approval(
            session_id, tool_call.id, timeout=30
        )
        if not approval:
            await manager.send_to_session(session_id, {
                "type": MessageType.TOOL_RESULT,
                "payload": {"tool_call_id": tool_call.id, "status": "rejected"},
            })
            continue

        result = await execute_tool(tool_call)
        await manager.send_to_session(session_id, {
            "type": MessageType.TOOL_RESULT,
            "payload": {"tool_call_id": tool_call.id, "result": result},
        })

    await manager.send_to_session(session_id, {
        "type": MessageType.AGENT_COMPLETED,
        "payload": {"reason": "completed"},
    })
```

## 心跳与断线重连

WebSocket 没有 SSE 自带的断线重连，需要手动实现：

```python
# 服务端心跳
@app.websocket("/ws/agent/{session_id}")
async def agent_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)

    async def send_heartbeat():
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_json({"type": "ping"})
            except Exception:
                break

    heartbeat_task = asyncio.create_task(send_heartbeat())
    # ... 主逻辑 ...
    heartbeat_task.cancel()
```

```javascript
// 客户端断线重连
class AgentWebSocket {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect() {
    this.ws = new WebSocket(`wss://your-agent.com/ws/agent/${this.sessionId}`);

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'ping') return; // 忽略心跳
      this.handleMessage(msg);
    };
  }
}
```

## 总结

WebSocket 是 SSE 的补充而非替代。当 Agent 需要与用户双向实时交互（工具审批、对话确认、任务取消）时，WebSocket 是唯一选择。核心设计要点：统一消息协议、连接管理器支持会话级广播、心跳保活、客户端指数退避重连。在 Agent 系统中，通常的做法是 SSE 负责 Token 流推送，WebSocket 负责控制信令。
