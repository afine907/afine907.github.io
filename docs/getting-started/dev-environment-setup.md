---
sidebar_position: 3
slug: dev-environment-setup
title: 开发环境搭建：从零配置你的 Agent 开发工具箱
---

# 开发环境搭建：从零配置你的 Agent 开发工具箱

这是整个 wiki 最"实操"的一篇文章。跟着一步步走完，你会拥有一个完整的 AI Agent 开发环境：Python、API Key、LangChain/LangGraph，以及一个能跑起来的 Hello World。

我假设你有一台电脑（Windows / macOS / Linux 都行），能上网，没有太多 Python 经验也没关系。

## 你需要的东西

| 工具 | 用途 | 是否必须 |
|------|------|---------|
| Python 3.10+ | 主流 Agent 开发语言 | ✅ 必须 |
| 代码编辑器（VS Code） | 写代码 | ✅ 必须 |
| OpenAI / Anthropic API Key | 调用 LLM | ✅ 必须 |
| LangChain / LangGraph | Agent 框架 | ✅ 推荐 |
| Git | 版本管理 | ⚠️ 建议 |
| Poetry / pip | Python 包管理 | ✅ 必须 |

## 第一步：安装 Python

**检查是否已有 Python：**

```bash
python --version
# 或者
python3 --version
```

如果输出 `Python 3.10.x` 或更高版本，跳过此步。

**安装 Python：**

- **Windows**：从 [python.org](https://www.python.org/downloads/) 下载安装包，**务必勾选 "Add Python to PATH"**
- **macOS**：`brew install python@3.12`
- **Linux**：`sudo apt install python3.12 python3.12-venv`

验证安装：

```bash
python --version  # 看到 Python 3.10+ 就对了
pip --version     # 包管理器应该一起装好了
```

## 第二步：配置虚拟环境（重要！）

**永远不要用全局 Python 装包**。虚拟环境隔离不同项目的依赖，避免版本冲突。

我推荐用 `venv`（Python 内置，无需额外安装）：

```bash
# 创建项目目录
mkdir my-first-agent
cd my-first-agent

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 看到终端前面多了 (.venv) 就说明激活成功
```

## 第三步：获取 API Key

Agent 需要调用 LLM，你需要一个 API Key。按偏好选一个：

### OpenAI（推荐入门）

1. 访问 [platform.openai.com](https://platform.openai.com)
2. 注册账号 → 进入 API 页面
3. 点击 "Create new secret key"
4. 复制保存（**关掉页面后就看不到了**）

### Anthropic Claude（推荐中文场景）

1. 访问 [console.anthropic.com](https://console.anthropic.com)
2. 注册 → 创建 API Key
3. Claude 的中文能力很强，上下文窗口 200K

**把 Key 存在环境变量里：**

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-your-key-here"

# macOS / Linux
export OPENAI_API_KEY="sk-your-key-here"
```

**更好的方式：存在 `.env` 文件中**

```bash
# 安装 dotenv 支持
pip install python-dotenv

# 创建 .env 文件
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

然后在代码中加载：

```python
from dotenv import load_dotenv
load_dotenv()
```

**⚠️ 永远不要把 API Key 提交到 Git！** 把 `.env` 加到 `.gitignore` 中。

## 第四步：安装核心依赖

激活虚拟环境后，执行：

```bash
# 核心依赖
pip install openai langchain langgraph

# 常用工具
pip install python-dotenv requests httpx

# 开发工具（推荐）
pip install black ruff mypy pytest
```

验证安装：

```bash
python -c "import openai; import langchain; print('OK')"
# 看到 OK 就说明装好了
```

## 第五步：验证 LLM 连接

写一个最简单的脚本测试 API 连接：

```python
# test_llm.py
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o-mini",  # 便宜且够用
    messages=[
        {"role": "user", "content": "用一句话解释 AI Agent"}
    ]
)

print(response.choices[0].message.content)
```

运行：

```bash
python test_llm.py
# 输出：AI Agent 是一个能自主感知环境、做出决策并采取行动来完成目标的智能程序。
```

如果你是 Claude 用户，对应代码：

```python
from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "用一句话解释 AI Agent"}
    ]
)

print(response.content[0].text)
```

## 第六步：VS Code 推荐配置

如果你用 VS Code，装这几个插件能大幅提升体验：

1. **Python** (ms-python.python) — IntelliSense、调试
2. **Pylance** (ms-python.vscode-pylance) — 类型检查
3. **Ruff** (charliermarsh.ruff) — 极速代码检查

创建 `.vscode/settings.json`：

```json
{
    "python.defaultInterpreterPath": ".venv/bin/python",
    "python.formatting.provider": "none",
    "[python]": {
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.ruff": true
        }
    }
}
```

## 完整的项目模板

把下面这些文件准备好，你就有了一个标准的 Agent 项目骨架：

```
my-first-agent/
├── .venv/               # 虚拟环境
├── .env                 # API Key（不要提交！）
├── .gitignore           # 忽略 .venv 和 .env
├── main.py              # 入口文件
└── requirements.txt     # 依赖清单
```

`.gitignore`：

```
.venv/
.env
__pycache__/
*.pyc
```

生成 `requirements.txt`：

```bash
pip freeze > requirements.txt
```

## 实践中的常见陷阱

**陷阱 1：忘了激活虚拟环境**

典型的场景是换了终端窗口后直接 `pip install`，结果装到了全局 Python。项目跑不起来，因为虚拟环境里啥也没有。**每次开新终端第一件事：激活虚拟环境。**

**陷阱 2：API Key 提交到了 GitHub**

常见的安全事故是把 API Key 直接写在代码里提交了。10 分钟后就可能收到 OpenAI 的警告邮件——有人扫到了 Key 开始滥用。**用 `.env` + `.gitignore` 保护好你的 Key。**

**陷阱 3：Python 版本不匹配**

某些 Agent 框架（比如 LangGraph）需要 Python 3.10+。在 3.8 上装了一小时，全是兼容性报错。**开发前确认 Python 版本 >= 3.10。**

## 下一步行动

1. 装好 Python + VS Code，完成上面的 LLM 连接测试
2. 确保你能成功调用 LLM API 并看到回复
3. 准备好 `.env` 和 `.gitignore`，养成安全习惯
4. 继续阅读 [你的第一个 Agent](./your-first-agent)，用 LangGraph 写一个真正能干的 Agent
