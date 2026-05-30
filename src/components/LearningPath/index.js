import React from 'react';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const pathColors = {
  beginner: { bg: '#f6ffed', border: '#52c41a', text: '#389e0d' },
  core: { bg: '#e6f7ff', border: '#1890ff', text: '#096dd9' },
  llm: { bg: '#f9f0ff', border: '#722ed1', text: '#531dab' },
  frontend: { bg: '#fff0f6', border: '#eb2f96', text: '#c41d7f' },
  backend: { bg: '#fff7e6', border: '#fa8c16', text: '#d46b08' },
  project: { bg: '#fff1f0', border: '#f5222d', text: '#cf1322' },
};

export default function LearningPath({ pathId, pathData }) {
  const colors = pathColors[pathId] || pathColors.beginner;

  return (
    <div
      className={styles.pathCard}
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className={styles.pathHeader}>
        <span className={styles.pathBadge} style={{ background: colors.border }}>
          {pathData.name}
        </span>
        <p className={styles.pathDesc}>{pathData.description}</p>
      </div>
      <div className={styles.steps}>
        {pathData.articles.map((article, index) => (
          <div key={article.docId} className={styles.stepRow}>
            <div
              className={styles.stepNumber}
              style={{ background: colors.border }}
            >
              {index + 1}
            </div>
            <Link to={`/${article.docId}`} className={styles.stepLink}>
              <span className={styles.stepTitle}>{article.title}</span>
              {article.description && (
                <span className={styles.stepDesc}>{article.description}</span>
              )}
            </Link>
            {index < pathData.articles.length - 1 && (
              <div className={styles.stepArrow} style={{ color: colors.border }}>
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
