---
sidebar_position: 6
title: LLM API 速率限制与节流
slug: rate-limiting-throttling
---

# LLM API 速率限制与节流

LLM API 调用不止花钱，还有速率限制。OpenAI 的 RPM（每分钟请求数）和 TPM（每分钟 Token 数）双重限制，一旦超限就返回 429。不做限流，上游一波动，下游全崩。

## 为什么需要速率限制

Agent 场景中速率限制要解决三个问题：

1. **防止滥用**：单个用户的异常行为（重试循环、并发过高）不会拖垮整个服务
2. **成本控制**：LLM API 按 Token 计费，无限制的调用意味着无限制的成本
3. **服务稳定性**：确保 LLM Provider 的配额不被某个用户耗尽，影响其他用户

## 经典限流算法

### Token Bucket（令牌桶）

最常用的算法，允许一定程度的突发流量：

```python
import time
import asyncio


class TokenBucket:
    def __init__(self, rate: float, capacity: int):
        self.rate = rate          # 每秒补充的 Token 数
        self.capacity = capacity  # 桶的最大容量
        self.tokens = capacity    # 当前 Token 数
        self.last_refill = time.monotonic()

    def _refill(self):
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_refill = now

    async def acquire(self) -> bool:
        self._refill()
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


bucket = TokenBucket(rate=10, capacity=20)  # 每秒 10 个，最大突发 20 个
```

### Leaky Bucket（漏桶）

流量更平滑，适合对抖动敏感的场景：

```python
class LeakyBucket:
    def __init__(self, rate: float, capacity: int):
        self.rate = rate
        self.capacity = capacity
        self.water = 0
        self.last_leak = time.monotonic()

    async def acquire(self) -> bool:
        now = time.monotonic()
        self.water = max(0, self.water - (now - self.last_leak) * self.rate)
        self.last_leak = now
        if self.water < self.capacity:
            self.water += 1
            return True
        return False
```

### Sliding Window（滑动窗口）

精确统计最近时间窗口内的请求数，适合面向用户的限流：

```python
from collections import deque


class SlidingWindow:
    def __init__(self, window_size: float, max_requests: int):
        self.window_size = window_size
        self.max_requests = max_requests
        self.timestamps: deque[float] = deque()

    async def acquire(self) -> bool:
        now = time.monotonic()
        # 清理过期的时间戳
        while self.timestamps and self.timestamps[0] < now - self.window_size:
            self.timestamps.popleft()
        if len(self.timestamps) < self.max_requests:
            self.timestamps.append(now)
            return True
        return False
```

## FastAPI 中间件实现

将限流逻辑封装为中间件，对路由透明：

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import time

app = FastAPI()

class RateLimitMiddleware:
    def __init__(self, app, rate: float = 10, capacity: int = 20):
        self.app = app
        self.bucket = TokenBucket(rate, capacity)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        if not await self.bucket.acquire():
            response = JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests", "retry_after": "1s"},
            )
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)


app.add_middleware(RateLimitMiddleware, rate=10, capacity=20)
```

### 用户级限流

更精细的做法是按用户维度限流：

```python
from collections import defaultdict


class UserRateLimiter:
    def __init__(self, default_rate: float = 5, capacity: int = 10):
        self.buckets: dict[str, TokenBucket] = defaultdict(
            lambda: TokenBucket(default_rate, capacity)
        )

    async def check(self, user_id: str) -> bool:
        return await self.buckets[user_id].acquire()


user_limiter = UserRateLimiter()


@app.post("/api/v1/chat")
async def chat(user_id: str = Depends(get_current_user)):
    if not await user_limiter.check(user_id):
        raise HTTPException(status_code=429, detail="Too Many Requests")
    ...
```

## LLM Provider 限流适配

不同 LLM Provider 的限流策略不同，需要统一适配：

```python
class LLMRateLimiter:
    def __init__(self, provider: str):
        if provider == "openai":
            # OpenAI: RPM + TPM 双重限制
            self.rpm_bucket = TokenBucket(rate=60 / 60, capacity=60)  # 60 RPM
            self.tpm_bucket = TokenBucket(rate=100000 / 60, capacity=100000)  # 100K TPM
        elif provider == "claude":
            # Anthropic: 每分钟请求数限制
            self.rpm_bucket = TokenBucket(rate=50 / 60, capacity=50)
            self.tpm_bucket = None

    async def acquire(self, estimated_tokens: int = 0) -> bool:
        if not await self.rpm_bucket.acquire():
            return False
        if self.tpm_bucket and not await self.tpm_bucket.acquire():
            return False
        return True
```

### 重试策略

配合限流的重试策略，使用指数退避：

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential


class RateLimitExceeded(Exception):
    """自定义限流异常"""
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
)
async def call_llm_with_retry(prompt: str, llm_limiter: LLMRateLimiter):
    if not await llm_limiter.acquire(len(prompt)):
        raise RateLimitExceeded()
    return await openai_client.chat.completions.create(...)
```

## 生产环境限流架构

```
Client → Nginx/反向代理（IP 级限流）
       → FastAPI 中间件（用户级限流）
       → LLM Provider 适配器（Provider 配额管理）
       → OpenAI / Claude / ...
```

每层限流的目的不同：Nginx 层防 DDoS，中间件层做用户配额管理，适配器层确保不超 Provider 的 Rate Limit。

## 总结

速率限制是 Agent 后端生产化必须处理的问题。Token Bucket 适合大多数场景，用户级限流保障多租户公平，Provider 限流适配器是"最后一公里"的关键防护。配合指数退避重试，才能构建稳定的 LLM 调用链路。
