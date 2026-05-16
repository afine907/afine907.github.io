---
sidebar_position: 2
slug: llm-basics
title: LLM 基础概念：搞懂 Token、上下文窗口和关键参数
---

# LLM 基础概念：搞懂 Token、上下文窗口和关键参数

你用 ChatGPT 聊过天，知道它能写代码、能翻译、能编故事。但当你开始开发 AI Agent 时，只靠"使用经验"远远不够——你得理解 LLM 是怎么工作的，才能预测它的行为、避开它的坑。

这不是一篇论文级别的深度学习讲解，而是开发 AI Agent **必须掌握的 LLM 基础知识**。看完你就懂了：Token 是什么、上下文窗口为什么重要、那些参数到底该怎么调。

## Token：LLM 的基本货币

LLM 不看字母也不看单词，它看的是 **Token**。

Token 是 LLM 处理文本的最小单位。你可以把 Token 理解为"词块"——一个 Token 可能是一个完整的词、一个词的一部分、甚至一个标点符号。

```
"AI Agent 开发" → ["AI", " Agent", " 开发"]
                    3 个 Token
```

不同语言、不同分词器的 Token 消耗差异很大：

| 文本 | Token 数（约） | 说明 |
|------|---------------|------|
| "Hello, world!" | 3 | 英文短句 |
| "你好世界" | 3-4 | 中文每个字约 1 Token |
| 一篇 1000 字的中文文章 | 1000-1500 | 中文 Token 消耗较高 |
| 一篇 1000 词的英文文章 | 700-800 | 英文 Token 效率更高 |

**为什么这对你重要？**

- **计费**：所有 LLM API 按 Token 计费（输入 + 输出）
- **限制**：模型有最大 Token 限制（上下文窗口）
- **设计**：Agent 的 Prompt、记忆、上下文管理都在跟 Token 打交道

## 上下文窗口：Agent 的"工作台"

上下文窗口（Context Window）是 LLM 一次能处理的最大 Token 数量。它就像 Agent 的工作台——台子越大，能同时摊开的东西越多。

| 模型 | 上下文窗口 | 大约相当于 |
|------|-----------|-----------|
| GPT-4 | 8K / 32K / 128K | 60 页 / 240 页 / 960 页书 |
| Claude 3.5 Sonnet | 200K | ~1500 页 |
| Claude 4 | 200K | ~1500 页 |
| DeepSeek-V3 | 128K | ~960 页 |

**关键认知：上下文窗口不是越大越好**

大窗口能装更多内容，但 LLM 对窗口中间的内容"注意力"会衰减。这叫做"Lost in the Middle"现象——模型对开头和结尾的内容记得最清，中间的内容容易丢失。

这对 Agent 设计的启示：

```
错误的做法：
把整本技术文档塞进上下文 → 模型"看"到了但没"注意"到

正确的做法：
1. 只放当前步骤需要的信息
2. 重要的指令放在 System Prompt 开头
3. 最新的上下文放在消息末尾
```

## 消息结构：System / User / Assistant

LLM API 的输入不是一段纯文本，而是**消息列表**。理解这个消息结构是 Agent 开发的基础：

```
messages = [
    {"role": "system",    "content": "你是资深 Python 开发者"},
    {"role": "user",      "content": "帮我写一个 FastAPI 应用"},
    {"role": "assistant", "content": "好的，我来设计..."},
    {"role": "user",      "content": "再加一个用户认证功能"},
]
```

| 角色 | 用途 | 在 Agent 中的角色 |
|------|------|------------------|
| **system** | 设定 AI 的行为和边界 | Agent 的系统指令（人格、规则、约束） |
| **user** | 代表用户输入 | 用户的请求、工具返回的结果 |
| **assistant** | 代表 AI 回复 | Agent 的思考过程、生成的回复 |

**Agent 开发的关键技巧**：把工具调用的结果包装成 user 消息喂回给模型，让模型"看到"工具执行的结果，然后决定下一步。

## 温度（Temperature）和其他关键参数

这些参数控制 LLM 的行为，直接影响 Agent 的稳定性和创造力。

### Temperature（温度）

控制输出的"随机性"：

- **0.0 - 0.3**：确定性高，适合代码生成、数据提取
- **0.5 - 0.7**：平衡，适合大部分对话场景
- **0.8 - 1.0**：高创意，适合头脑风暴、写作

```
Temperature = 0.0 → "Python 是一种编程语言"
Temperature = 0.9 → "Python 嘛，就像编程界的瑞士军刀，啥都能干"
```

**Agent 开发建议**：Agent 的推理步骤用 0.0-0.3（要稳定），生成最终回复可以用 0.5-0.7（要自然）。

### Top P（核采样）

另一种控制多样性的参数。一般调 Temperature 就够了，Top P 保持默认（0.9-1.0）即可。

**经验法则**：调 Temperature 就别动 Top P，反之亦然。两个一起调容易互相抵消。

### Max Tokens（最大输出长度）

限制模型一次回复的最大 Token 数。

- 太短 → Agent 没说完就被截断
- 太长 → 浪费 Token，增加延迟

**Agent 开发的技巧**：给 Agent 的推理步骤设定一个合理的 Max Tokens（比如 1024），避免它"想太多"。

## 函数调用 / Tool Use

这是 Agent 开发最核心的 LLM 能力。大部分现代 LLM 支持"函数调用"（Function Calling）或"工具使用"（Tool Use）：

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "搜索互联网获取最新信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "搜索关键词"}
                },
                "required": ["query"]
            }
        }
    }
]

# LLM 返回的不是文本，而是函数调用请求
response = llm.chat(messages=messages, tools=tools)
# response.tool_calls = [{ "name": "search_web", "args": {"query": "..."} }]
```

LLM 不直接执行函数——它**请求**调用函数，你的代码负责实际执行，然后把结果喂回给 LLM。

```
Agent → LLM: "帮我查一下今天的天气"
LLM  → Agent: {"function": "search_web", "args": {"query": "北京今天天气"}}
Agent → 执行 search_web("北京今天天气") → 返回结果
Agent → LLM: "搜索结果如下：[...] 请总结"
LLM  → Agent: "北京今天 25°C，晴..."
```

## 我踩过的坑

**坑 1：忽视 Token 消耗**

第一个 Agent 上线后，单次对话消耗了 50 万 Token——账单感人。当时没做任何 Token 管理，把所有历史消息一股脑全塞进上下文。后来加了滑动窗口压缩，成本降了 80%。

**坑 2：Temperature 设太高导致 Agent "发疯"**

早期我把 Temperature 设到 0.8，想让 Agent 回答更"生动"。结果 Agent 在工具选择上开始"自由发挥"——有时候选择搜索、有时候选择读文件、有时候什么都不选直接编答案。**Agent 的决策部分 Temperature 一定要低（0-0.3）。**

**坑 3：以为"上下文窗口大"就可以随便塞**

换了 200K 模型后，我把整本 API 文档都塞进 System Prompt。结果 Agent 开始忽略一些关键指令——不是没看到，是"注意力"被稀释了。**大窗口不是免死金牌，信息密度比信息总量更重要。**

## 下一步行动

1. 打开任意 LLM 的 API Playground，用不同 Temperature 生成同一句话看看差异
2. 用 Python 写一段代码，打印一段文本被分成多少个 Token（OpenAI 的 `tiktoken` 库很好用）
3. 理解 Token 是怎么影响你的成本和 Agent 设计的
4. 继续阅读 [开发环境搭建](./dev-environment-setup)，把开发环境配好
