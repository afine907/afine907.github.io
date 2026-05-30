---
sidebar_position: 0
slug: /roadmap
title: 学习路线图
description: AI Agent 开发学习路线图 —— 从入门到实战的完整路径
---

import KnowledgeGraph from '@site/src/components/KnowledgeGraph';
import LearningPath from '@site/src/components/LearningPath';
import {learningPaths, dependencies} from '@site/src/components/KnowledgeGraph/data';

# 🗺️ 学习路线图

AI Agent 开发是一条宽而深的技能树。这里提供了一条**经过验证的学习路径**，帮助你从零基础到独立开发完整的 Agent 系统。

---

## 📊 知识图谱

下图展示了各文章之间的**前置依赖关系**。箭头方向表示阅读顺序——先读箭头尾部的文章，再读箭头指向的文章。

<KnowledgeGraph learningPaths={learningPaths} dependencies={dependencies} />

---

## 🛤️ 推荐学习路径

按照以下顺序阅读，每个阶段完成后进入下一阶段。

<LearningPath pathId="beginner" pathData={learningPaths.beginner} />

<LearningPath pathId="core" pathData={learningPaths.core} />

<LearningPath pathId="llm" pathData={learningPaths.llm} />

<LearningPath pathId="frontend" pathData={learningPaths.frontend} />

<LearningPath pathId="backend" pathData={learningPaths.backend} />

<LearningPath pathId="project" pathData={learningPaths.project} />

---

## 💡 学习建议

1. **入门阶段**不要跳过，扎实的基础是后续学习的前提
2. **核心开发**阶段重点理解 Agent 架构设计思想，不必急于掌握所有工具
3. **LLM 集成**和**前端交互**可以并行学习，根据你的技术背景选择先后
4. **后端服务**和**云原生部署**是生产化的必备技能
5. **项目实战**是最好的综合练习，建议动手完成至少一个完整项目

---

## 🔍 按兴趣选择

如果你已有明确方向，可以直接跳转：

| 方向 | 起点文章 |
|------|----------|
| Agent 架构设计 | [Agent 记忆系统设计](/agent-architecture/memory-system) |
| RAG 知识库 | [RAG 系统架构设计](/rag/rag-system-architecture) |
| LLM 集成 | [多 LLM API 统一接入](/llm-integration/multi-llm-api-integration) |
| Agent 前端 | [Agent 对话 UI 设计与实现](/agent-frontend/agent-chat-ui-design) |
| Python 后端 | [FastAPI + LangChain 实战](/backend-python/fastapi-langchain-practice) |
| 云原生部署 | [Docker 容器化实战](/cloud-native/docker-containerization) |
| 框架选型 | [主流 Agent 框架对比评测](/agent-framework/framework-comparison) |
