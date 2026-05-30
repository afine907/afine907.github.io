---
sidebar_position: 4
slug: your-first-agent
title: 你的第一个 Agent：用 LangGraph 构建命令行搜索助手
---

# 你的第一个 Agent：用 LangGraph 构建命令行搜索助手

前面三篇文章讲了概念、讲了 LLM、配好了环境。现在是时候写真正的 Agent 了。

这一篇我们做一个**命令行搜索助手**——你输入问题，它能自己决定要不要搜索来获取最新信息，然后给出答案。整个过程不超过 50 行代码，但完整走完**感知-推理-行动**的全流程。

## 你要做的东西

```
你输入：LangGraph 最新版本是多少？

Agent 的思考：
  → 用户问的是最新版本，我的知识可能不是最新的
  → 需要搜索一下
  → 调用搜索工具
  
Agent 搜索到了结果：
  → LangGraph 最新版本是 v0.2.45
  → 回答用户
```

## 前置条件

- 完成了[开发环境搭建](./dev-environment-setup)，Python 和 API Key 就绪
- 安装了 `langgraph`、`langchain`、`openai`

```bash
pip install langgraph langchain langchain-openai
```

## 第一步：定义 Agent 的工具

Agent 的核心是工具。先给 Agent 一个搜索工具：

```python
# search_tool.py
import requests
from langchain.tools import tool

@tool
def search_web(query: str) -> str:
    """搜索互联网获取最新信息"""
    try:
        # 用 DuckDuckGo 的搜索 API（无需 Key）
        url = f"https://api.duckduckgo.com/?q={query}&format=json"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        # 提取摘要
        abstract = data.get("AbstractText", "")
        if abstract:
            return abstract
        
        # 没有摘要就返回相关话题
        topics = data.get("RelatedTopics", [])
        if topics:
            return topics[0].get("Text", "未找到相关信息")
        
        return f"搜索 '{query}' 没有返回结果"
    except Exception as e:
        return f"搜索出错: {str(e)}"
```

这个工具做了什么：
- 接收一个搜索关键词
- 调用 DuckDuckGo API 搜索（免费，不需要注册）
- 返回搜索结果摘要

**注意**：`@tool` 装饰器来自 LangChain，它把普通函数变成 Agent 可以调用的"工具"。函数的类型注解和 docstring 都会被 LLM 看到，所以 **docstring 要写清楚工具的作用**。

## 第二步：构建 Agent

```python
# agent.py
from dotenv import load_dotenv
from langgraph.graph import StateGraph, MessagesState
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from search_tool import search_web

load_dotenv()

# 1. 初始化 LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",  # 便宜且够用
    temperature=0.1,       # Agent 的推理要稳定
)

# 2. 绑定工具
tools = [search_web]
llm_with_tools = llm.bind_tools(tools)

# 3. 定义 Agent 的"推理"节点
def agent_reason(state: MessagesState):
    """Agent 看到消息后决定下一步做什么"""
    result = llm_with_tools.invoke(state["messages"])
    return {"messages": [result]}

# 4. 构建状态图
graph = StateGraph(MessagesState)

# 添加节点
graph.add_node("agent", agent_reason)
graph.add_node("tools", ToolNode(tools))

# 设置入口
graph.set_entry_point("agent")

# 添加条件边：Agent 如果调用了工具就去 tools 节点，否则结束
def should_continue(state):
    last_msg = state["messages"][-1]
    if last_msg.tool_calls:
        return "tools"
    return "__end__"

graph.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "__end__": "__end__",
})

# 工具执行完后回到 Agent 继续推理
graph.add_edge("tools", "agent")

# 编译
app = graph.compile()
```

这段代码看起来有点多，但它做的事情很简单：

```
用户输入 → Agent 推理
                │
          ┌─────┴─────┐
          │ 需要工具?  │
          └─────┬─────┘
                │
       是 ↓         否 ↓
     执行工具     输出答案
        │
   回到推理(循环)
```

这就是前面讲的**感知-推理-行动循环**的代码实现。

## 第三步：运行 Agent

```python
# main.py
from agent import app

def main():
    print("🤖 你的第一个 AI Agent")
    print("输入问题（输入 'quit' 退出）\n")
    
    while True:
        question = input("> ")
        if question.lower() in ("quit", "exit"):
            break
        
        # 运行 Agent
        result = app.invoke({
            "messages": [("user", question)]
        })
        
        # 输出最终回答
        last_msg = result["messages"][-1]
        print(f"\n🤖 {last_msg.content}\n")

if __name__ == "__main__":
    main()
```

## 完整运行示例

```
🤖 你的第一个 AI Agent
输入问题（输入 'quit' 退出）

> LangGraph 最新版本是多少？

🤖 LangGraph 的最新版本是 v0.2.45（2024 年 12 月发布）。
该版本引入了对 LangGraph Cloud 的改进，包括更好的状态持久化和新的 ReAct Agent 模板。

> Python 3.13 有什么新特性？

🤖 Python 3.13 引入了多项改进：
- 改进的交互式解释器（支持彩色提示符和多行编辑）
- JIT 编译器（实验性，提升性能）
- 类型系统的增强（TypeVar 默认值）
- 实验性的 free-threaded 构建模式（禁用 GIL）
```

如果你看到 Agent 在思考和搜索，恭喜你——你已经写出了第一个真正的 AI Agent！

## Agent 是如何工作的（拆解）

整个流程是这样的：

```
步骤 1: 用户输入 "LangGraph 最新版本是多少？"
        ↓
步骤 2: Agent 节点收到消息，LLM 推理 →
        "用户问最新版本，我可能需要搜索，
        调用 search_web(query='LangGraph 最新版本 2024')"
        ↓
步骤 3: LLM 返回 tool_calls → 进入 tools 节点
        ↓
步骤 4: search_web 执行，返回搜索结果
        ↓
步骤 5: 回到 Agent 节点，LLM 看到搜索结果 →
        "根据搜索结果，最新版本是 v0.2.45"
        ↓
步骤 6: LLM 没有继续调用工具 → 结束循环
        ↓
步骤 7: 输出最终答案
```

## 扩展你的 Agent

现在你已经有一个能工作的 Agent 了，给它加更多工具：

```python
@tool
def calculate(expression: str) -> str:
    """执行数学计算"""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"计算错误: {e}"

@tool
def get_time(timezone: str = "Asia/Shanghai") -> str:
    """获取指定时区的当前时间"""
    from datetime import datetime
    import pytz
    tz = pytz.timezone(timezone)
    return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")

# 绑定所有工具
tools = [search_web, calculate, get_time]
```

加一个工具，Agent 就多一项能力——这就是 Agent 可扩展性的精髓。

## 实践中的常见陷阱

**陷阱 1：Agent 进入了死循环**

典型的场景是 Agent 在"调用工具 → 回到推理 → 再次调用同一工具"之间无限循环。原因是工具返回的结果不够明确，LLM 以为没成功就一直重试。**在工具返回结果中加上明确的成功/失败信号**，LLM 才能正确判断。

**陷阱 2：忘记 Temperature 调低**

如果 Agent 推理步骤 Temperature 设成 0.8，它有时候选择搜索，有时候选择"猜一个答案"，行为完全不可预测。**Agent 的推理部分 Temperature 设 0-0.1。**

**陷阱 3：工具太多让 Agent 选错**

一口气给 Agent 加了 10 个工具，结果它经常在简单问题上选错工具——查天气去调用搜索而不是天气 API。**刚开始给 Agent 2-3 个工具就够了**，慢慢加。

## 下一步行动

1. 把上面的代码跑起来，确认你的 Agent 能正常工作
2. 给 Agent 加一个自定义工具（比如查天气、计算器）
3. 试试用不同的 LLM（Claude、DeepSeek）运行同一个 Agent
4. 继续阅读 [Agent 架构设计](/agent-architecture/long-term-memory)，学习如何给 Agent 加上记忆能力

## 完整代码

```python
# agent.py - 完整代码
from dotenv import load_dotenv
from langgraph.graph import StateGraph, MessagesState
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain.tools import tool
import requests

load_dotenv()

# 工具
@tool
def search_web(query: str) -> str:
    """搜索互联网获取最新信息"""
    url = f"https://api.duckduckgo.com/?q={query}&format=json"
    response = requests.get(url, timeout=10)
    data = response.json()
    abstract = data.get("AbstractText", "")
    if abstract:
        return abstract
    topics = data.get("RelatedTopics", [])
    if topics:
        return topics[0].get("Text", "未找到相关信息")
    return f"搜索 '{query}' 没有返回结果"

# LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
tools = [search_web]
llm_with_tools = llm.bind_tools(tools)

# Agent 推理
def agent_reason(state: MessagesState):
    result = llm_with_tools.invoke(state["messages"])
    return {"messages": [result]}

# 构建图
graph = StateGraph(MessagesState)
graph.add_node("agent", agent_reason)
graph.add_node("tools", ToolNode(tools))
graph.set_entry_point("agent")

def should_continue(state):
    last_msg = state["messages"][-1]
    if last_msg.tool_calls:
        return "tools"
    return "__end__"

graph.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "__end__": "__end__",
})
graph.add_edge("tools", "agent")

app = graph.compile()

# 运行
if __name__ == "__main__":
    while True:
        question = input("> ")
        if question.lower() in ("quit", "exit"):
            break
        result = app.invoke({"messages": [("user", question)]})
        print(f"\n🤖 {result['messages'][-1].content}\n")
```
