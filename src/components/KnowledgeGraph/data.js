/**
 * 知识图谱数据 —— 学习路线 & 文章依赖关系
 *
 * docId 格式：category/slug（与 frontmatter 中的 slug 一致）
 */

export const learningPaths = {
  beginner: {
    name: '入门路径',
    description: '从零开始认识 AI Agent，建立基本概念',
    articles: [
      { docId: 'getting-started/what-is-ai-agent', title: 'AI Agent 是什么？', description: '理解 Agent 核心概念与应用场景' },
      { docId: 'getting-started/llm-basics', title: 'LLM 基础概念', description: '大语言模型的工作原理' },
      { docId: 'getting-started/dev-environment-setup', title: '开发环境搭建', description: '配置开发工具与环境' },
      { docId: 'getting-started/your-first-agent', title: '你的第一个 Agent', description: '动手创建第一个 Agent' },
    ],
  },
  core: {
    name: '核心开发',
    description: 'Agent 架构设计与工程实践，掌握开发核心技能',
    articles: [
      { docId: 'agent-engineering/prompt-design', title: 'Agent Prompt 设计指南', description: '设计高质量的系统提示词' },
      { docId: 'agent-engineering/tool-development', title: 'Agent 工具开发指南', description: '为 Agent 开发自定义工具' },
      { docId: 'agent-engineering/mcp-guide', title: 'Agent MCP 实战指南', description: 'Model Context Protocol 集成' },
      { docId: 'agent-architecture/memory-system', title: 'Agent 记忆系统设计', description: '短期与长期记忆的实现' },
      { docId: 'agent-architecture/tool-permission-design', title: 'Agent 工具权限设计', description: '工具调用的安全管控' },
      { docId: 'agent-engineering/langgraph-orchestration', title: 'LangGraph Agent 编排实战', description: '用 LangGraph 构建复杂 Agent' },
      { docId: 'agent-engineering/state-management', title: 'Agent 状态管理设计', description: 'Agent 状态流转与管理' },
    ],
  },
  llm: {
    name: 'LLM 深度集成',
    description: 'RAG 知识库构建与 LLM API 实战',
    articles: [
      { docId: 'rag/rag-system-architecture', title: 'RAG 系统架构设计', description: '检索增强生成的整体架构' },
      { docId: 'rag/vector-database-selection', title: '向量数据库选型实战', description: 'Milvus / Pinecone / Weaviate 对比' },
      { docId: 'rag/embedding-model-selection', title: 'Embedding 模型选型与微调', description: '选择和微调嵌入模型' },
      { docId: 'rag/chunking-strategies', title: 'Chunking 策略深度解析', description: '文档分块的最佳实践' },
      { docId: 'llm-integration/multi-llm-api-integration', title: '多 LLM API 统一接入', description: '一套代码接入多家 LLM' },
      { docId: 'llm-integration/prompt-engineering-advanced', title: 'Prompt 工程进阶', description: '高级提示词工程技巧' },
    ],
  },
  frontend: {
    name: '前端交互',
    description: 'Agent UI 设计与 SSE 流式渲染',
    articles: [
      { docId: 'agent-frontend/agent-chat-ui-design', title: 'Agent 对话 UI 设计与实现', description: '构建 Agent 交互界面' },
      { docId: 'agent-frontend/agent-sse-streaming-component', title: 'Agent SSE 流式可视化', description: '实时流式渲染 Agent 输出' },
      { docId: 'agent-frontend/generative-ui-practice', title: 'Generative UI 实践', description: 'AI 动态生成界面组件' },
      { docId: 'agent-frontend/agent-debug-panel', title: 'Agent 可视化调试面板', description: '调试与监控 Agent 运行' },
    ],
  },
  backend: {
    name: '后端服务',
    description: 'Python 后端与云原生部署',
    articles: [
      { docId: 'backend-python/fastapi-langchain-practice', title: 'FastAPI + LangChain 实战', description: '构建 Agent 后端服务' },
      { docId: 'backend-python/async-programming-concurrency', title: '异步编程与并发模型', description: 'Python 异步编程深入' },
      { docId: 'backend-python/database-design-orm', title: '数据库设计与 ORM', description: 'SQLAlchemy 实践' },
      { docId: 'cloud-native/docker-containerization', title: 'Docker 容器化实战', description: '容器化 Agent 服务' },
      { docId: 'cloud-native/k8s-agent-deployment', title: 'K8s 部署 Agent 服务', description: 'Kubernetes 编排部署' },
    ],
  },
  project: {
    name: '项目实战',
    description: '完整项目开发与架构实战',
    articles: [
      { docId: 'ai-projects/jojo-code-coding-agent', title: 'jojo-code Coding Agent 实战', description: 'AI 编码 Agent 项目解析' },
      { docId: 'ai-native-pipeline/pipeline-design', title: 'AI Native Pipeline 设计实践', description: '全自动开发流水线' },
      { docId: 'fullstack-agent-project/smart-city-agent-multi-agent', title: 'smart-city-agent 多 Agent 协同', description: '多 Agent 协作项目实战' },
      { docId: 'fullstack-agent-project/project-review-summary', title: '项目复盘与面试表达', description: '总结经验，准备面试' },
    ],
  },
};

/**
 * 文章依赖关系
 * from → to 表示「读完 from 之后再读 to」
 */
export const dependencies = [
  // 入门路径内部
  { from: 'getting-started/what-is-ai-agent', to: 'getting-started/llm-basics' },
  { from: 'getting-started/llm-basics', to: 'getting-started/dev-environment-setup' },
  { from: 'getting-started/dev-environment-setup', to: 'getting-started/your-first-agent' },

  // 入门 → 核心
  { from: 'getting-started/your-first-agent', to: 'agent-engineering/prompt-design' },
  { from: 'getting-started/your-first-agent', to: 'agent-engineering/tool-development' },

  // 核心内部
  { from: 'agent-engineering/tool-development', to: 'agent-engineering/mcp-guide' },
  { from: 'agent-engineering/mcp-guide', to: 'agent-architecture/memory-system' },
  { from: 'agent-architecture/memory-system', to: 'agent-architecture/tool-permission-design' },
  { from: 'agent-engineering/mcp-guide', to: 'agent-engineering/langgraph-orchestration' },
  { from: 'agent-engineering/langgraph-orchestration', to: 'agent-engineering/state-management' },

  // 核心 → LLM
  { from: 'agent-engineering/mcp-guide', to: 'rag/rag-system-architecture' },
  { from: 'agent-engineering/tool-development', to: 'llm-integration/multi-llm-api-integration' },

  // LLM 内部
  { from: 'rag/rag-system-architecture', to: 'rag/vector-database-selection' },
  { from: 'rag/vector-database-selection', to: 'rag/embedding-model-selection' },
  { from: 'rag/embedding-model-selection', to: 'rag/chunking-strategies' },
  { from: 'llm-integration/multi-llm-api-integration', to: 'llm-integration/prompt-engineering-advanced' },

  // LLM → 前端
  { from: 'llm-integration/multi-llm-api-integration', to: 'agent-frontend/agent-chat-ui-design' },
  { from: 'agent-frontend/agent-chat-ui-design', to: 'agent-frontend/agent-sse-streaming-component' },
  { from: 'agent-frontend/agent-sse-streaming-component', to: 'agent-frontend/generative-ui-practice' },

  // 核心 → 后端
  { from: 'agent-engineering/langgraph-orchestration', to: 'backend-python/fastapi-langchain-practice' },

  // 后端内部
  { from: 'backend-python/fastapi-langchain-practice', to: 'backend-python/async-programming-concurrency' },
  { from: 'backend-python/async-programming-concurrency', to: 'backend-python/database-design-orm' },
  { from: 'backend-python/fastapi-langchain-practice', to: 'cloud-native/docker-containerization' },
  { from: 'cloud-native/docker-containerization', to: 'cloud-native/k8s-agent-deployment' },

  // 前端 + 后端 → 项目实战
  { from: 'cloud-native/k8s-agent-deployment', to: 'ai-native-pipeline/pipeline-design' },
  { from: 'agent-frontend/generative-ui-practice', to: 'ai-native-pipeline/pipeline-design' },
  { from: 'ai-native-pipeline/pipeline-design', to: 'ai-projects/jojo-code-coding-agent' },
  { from: 'ai-native-pipeline/pipeline-design', to: 'fullstack-agent-project/smart-city-agent-multi-agent' },
  { from: 'fullstack-agent-project/smart-city-agent-multi-agent', to: 'fullstack-agent-project/project-review-summary' },
];
