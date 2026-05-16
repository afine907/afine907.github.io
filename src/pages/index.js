import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ArticleList, { groups } from '@site/src/components/ArticleList';
import SkillRadar from '@site/src/components/SkillRadar';
import TechTags from '@site/src/components/TechTags';
import QuickNav from '@site/src/components/QuickNav';
import styles from './index.module.css';

const totalArticles = groups.reduce(
  (sum, g) => sum + g.categories.reduce((s, c) => s + c.items.length, 0),
  0
);

function AnimatedStat({ target, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className={styles.statItem}>
      <span className={styles.statNumber}>
        {count}{suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <p className={styles.heroDescription}>
              全栈 AI Agent 开发者的 T 型技能树 —— 一专多能，从架构到部署的全链路技术沉淀
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="/">
                浏览文章 ↓
              </Link>
              <Link
                className="button button--outline button--lg"
                href="https://github.com/afine907"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
                GitHub
              </Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            <AnimatedStat target={totalArticles} suffix="+" label="篇文章" />
            <AnimatedStat target={14} suffix="" label="个分类" />
            <AnimatedStat target={100} suffix="%" label="AI Agent" />
          </div>
        </div>
      </div>
    </header>
  );
}

function AboutText() {
  return (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className={styles.aboutContent}>
          <p>
            AI Agent 开发是一条宽而深的技能树。这里记录了从 <strong>Agent 架构</strong>到底层 <strong>LLM 集成</strong>、
            从前端交互到后端服务、从云原生部署到项目实战的全链路知识沉淀。
          </p>
          <p>
            <strong>一专多能</strong>，是每个 AI Agent 开发者的成长路径。
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturedArticles() {
  const featured = [
    {
      title: '🚀 AI Native Pipeline 设计实践',
      description: '从需求到代码的全自动开发流水线',
      docId: 'ai-native-pipeline/pipeline-design',
    },
    {
      title: '🛡️ Agent 安全威胁与防御策略',
      description: 'jojo-code 安全模块源码级剖析',
      docId: 'agent-architecture-level/security-defense',
    },
    {
      title: '📊 主流 Agent 框架对比评测',
      description: 'LangGraph、LangChain、AutoGen、CrewAI 深度评测',
      docId: 'agent-framework/framework-comparison',
    },
  ];

  return (
    <section className={styles.featuredSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>✨ 精选文章</h2>
        <div className={styles.featuredGrid}>
          {featured.map((article, idx) => (
            <Link
              key={idx}
              to={`/${article.docId}`}
              className={styles.featuredCard}>
              <h3 className={styles.featuredTitle}>{article.title}</h3>
              <p className={styles.featuredDescription}>{article.description}</p>
              <span className={styles.readMore}>阅读文章 →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="首页"
      description="jojo 的技术空间 - AI Agent 开发者 · 技术探索者">
      <HomepageHeader />
      <main>
        <SkillRadar />
        <AboutText />
        <TechTags />
        <FeaturedArticles />
        <QuickNav />
        <section className={styles.allArticlesSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>📚 全部文章</h2>
          </div>
          <ArticleList />
        </section>
      </main>
    </Layout>
  );
}
