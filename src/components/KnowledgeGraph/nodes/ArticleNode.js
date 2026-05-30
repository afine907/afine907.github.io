import React from 'react';
import { Handle, Position } from 'reactflow';
import Link from '@docusaurus/Link';
import styles from './ArticleNode.module.css';

const pathColors = {
  beginner: '#52c41a',
  core: '#1890ff',
  llm: '#722ed1',
  frontend: '#eb2f96',
  backend: '#fa8c16',
  project: '#f5222d',
};

export default function ArticleNode({ data }) {
  const color = pathColors[data.pathId] || '#1890ff';

  return (
    <div className={styles.node} style={{ borderColor: color }}>
      <Handle type="target" position={Position.Top} />
      <Link to={`/${data.docId}`} className={styles.link}>
        <span className={styles.label}>{data.label}</span>
      </Link>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
