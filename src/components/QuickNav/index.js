import React from 'react';
import { groups } from '@site/src/components/ArticleList';
import styles from './styles.module.css';

export default function QuickNav() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>快速导航</h2>
        <div className={styles.grid}>
          {groups.map((group, idx) => (
            <a
              key={idx}
              href={`#group-${idx}`}
              className={styles.card}
            >
              <span className={styles.arrow}>→</span>
              <span className={styles.label}>{group.label.replace(/^[^\s]+\s/, '')}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
