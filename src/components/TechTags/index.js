import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const TAGS = [
  { name: 'LangGraph', color: 'ai' },
  { name: 'OpenAI', color: 'ai' },
  { name: 'Claude', color: 'ai' },
  { name: 'RAG', color: 'ai' },
  { name: 'FastAPI', color: 'backend' },
  { name: 'Celery', color: 'backend' },
  { name: 'Redis', color: 'backend' },
  { name: 'PostgreSQL', color: 'backend' },
  { name: 'OpenTelemetry', color: 'backend' },
  { name: 'React', color: 'frontend' },
  { name: 'SSE', color: 'frontend' },
  { name: 'WebSocket', color: 'frontend' },
  { name: 'XState', color: 'frontend' },
  { name: 'Docker', color: 'devops' },
  { name: 'Kubernetes', color: 'devops' },
  { name: 'GitHub Actions', color: 'devops' },
  { name: 'Prometheus', color: 'devops' },
  { name: 'Milvus', color: 'ai' },
  { name: 'Zustand', color: 'frontend' },
  { name: 'Micro Frontend', color: 'frontend' },
];

export default function TechTags() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>技术栈速览</h2>
        <p className={styles.subtitle}>覆盖的技术与工具</p>
        <div className={styles.tagCloud}>
          {TAGS.map((tag, idx) => (
            <Link
              key={idx}
              to={`/search?q=${encodeURIComponent(tag.name)}`}
              className={`${styles.tag} ${styles[tag.color]}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
