import React from 'react';
import Link from '@docusaurus/Link';
import { groups } from '@site/src/components/ArticleList';
import styles from './styles.module.css';

// Per-group metadata: color class, entry doc, description
const groupMeta = [
  { colorClass: 'colorGreen', docId: 'getting-started/what-is-ai-agent', desc: '概念基础 · LLM 原理 · 环境搭建 · 第一个 Agent' },
  { colorClass: 'colorBlue', docId: 'agent-architecture/long-term-memory', desc: '架构设计 · 工程实践 · RAG · LLM 集成 · 框架对比' },
  { colorClass: 'colorPink', docId: 'agent-frontend/agent-sse-streaming-component', desc: 'SSE 流渲染 · 对话 UI · Generative UI · 前端工程化' },
  { colorClass: 'colorOrange', docId: 'backend-python/fastapi-langchain-practice', desc: 'FastAPI · 异步编程 · 数据库 · 认证 · 可观测性' },
  { colorClass: 'colorCyan', docId: 'agent-ops/deployment', desc: 'Docker · K8s · CI/CD · 监控告警 · 生产实践' },
  { colorClass: 'colorPurple', docId: 'agent-projects/project-development', desc: 'jojo-code · smart-city-agent · 全栈项目实战' },
];

/** Decorative golden divider between groups */
function Divider({ label }) {
  return (
    <div className={styles.divider}>
      <span>{label}</span>
    </div>
  );
}

/** Single category card */
function GroupCard({ group, meta, idx }) {
  const count = group.categories.reduce(
    (sum, c) => sum + c.items.length, 0
  );
  const label = group.label.replace(/^[^\s]+\s/, '');
  const emoji = group.label.match(/^(\S+)/)?.[0] || '📚';
  const colorClass = styles[meta.colorClass] || '';

  return (
    <Link
      to={`/${meta.docId}`}
      className={`${styles.card} ${colorClass}`}
    >
      <span className={styles.emojiBox}>{emoji}</span>
      <div className={styles.cardBody}>
        <span className={styles.cardTitle}>{label}</span>
        <span className={styles.cardDesc}>{meta.desc}</span>
      </div>
      <span className={styles.count}>{count} 篇</span>
    </Link>
  );
}

export default function QuickNav() {
  // Pair up groups: [0,1], [2,3], [4,5]
  const pairs = [];
  for (let i = 0; i < groups.length; i += 2) {
    pairs.push({
      dividerLabel: groups[i + 1]
        ? groups[i + 1].label.replace(/^[^\s]+\s/, '')
        : null,
      left: { group: groups[i], meta: groupMeta[i], idx: i },
      right: groups[i + 1]
        ? { group: groups[i + 1], meta: groupMeta[i + 1], idx: i + 1 }
        : null,
    });
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>📂 知识分类</h2>
        <p className={styles.subtitle}>选择一个方向开始探索</p>

        <div className={styles.cardList}>
          {pairs.map((pair, pairIdx) => (
            <React.Fragment key={pairIdx}>
              {/* Golden divider between groups (skip first pair) */}
              {pairIdx > 0 && <Divider label={pair.dividerLabel} />}
              <div className={styles.row}>
                <GroupCard {...pair.left} />
                {pair.right && <GroupCard {...pair.right} />}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
