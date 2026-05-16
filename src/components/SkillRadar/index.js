import React, { useEffect, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

const SKILL_DIMENSIONS = [
  { name: 'Agent 架构', value: 95 },
  { name: 'LLM / RAG', value: 90 },
  { name: '前端开发', value: 75 },
  { name: '后端开发', value: 80 },
  { name: 'DevOps', value: 70 },
  { name: '项目实战', value: 85 },
];

function SkillRadarChart() {
  const chartRef = useRef(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    let chart = null;
    let observer = null;
    let disposed = false;

    async function initChart() {
      const echarts = await import('echarts/core');
      const { RadarChart } = await import('echarts/charts');
      const {
        TooltipComponent,
        LegendComponent,
      } = await import('echarts/components');
      const { CanvasRenderer } = await import('echarts/renderers');

      echarts.use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer]);

      if (disposed || !chartRef.current) return;

      chart = echarts.init(chartRef.current);

      const style = getComputedStyle(document.documentElement);
      const isDark = colorMode === 'dark';

      const axisColor = style.getPropertyValue('--ifm-color-emphasis-700').trim() || (isDark ? '#b0b0b0' : '#555');
      const splitAreaColor = isDark
        ? ['rgba(37,194,160,0.04)', 'rgba(37,194,160,0.1)']
        : ['rgba(46,133,85,0.03)', 'rgba(46,133,85,0.08)'];
      const primary = style.getPropertyValue('--ifm-color-primary').trim() || (isDark ? '#25c2a0' : '#2e8555');
      const bg = style.getPropertyValue('--ifm-background-color').trim() || (isDark ? '#1b1b1d' : '#fff');

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
        },
        radar: {
          indicator: SKILL_DIMENSIONS.map((d) => ({ name: d.name, max: 100 })),
          shape: 'circle',
          radius: '70%',
          axisName: {
            color: axisColor,
            fontSize: 13,
            fontWeight: 500,
          },
          splitArea: {
            areaStyle: {
              color: splitAreaColor,
            },
          },
          splitLine: {
            lineStyle: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          },
          axisLine: {
            lineStyle: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          },
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: SKILL_DIMENSIONS.map((d) => d.value),
                name: '技能覆盖',
                areaStyle: {
                  color: {
                    type: 'radial',
                    x: 0.5,
                    y: 0.5,
                    r: 0.5,
                    colorStops: [
                      { offset: 0, color: primary + '60' },
                      { offset: 1, color: primary + '15' },
                    ],
                  },
                },
                lineStyle: {
                  color: primary,
                  width: 2,
                },
                itemStyle: {
                  color: primary,
                },
              },
            ],
          },
        ],
      };

      chart.setOption(option);

      observer = new ResizeObserver(() => {
        if (chart && !disposed) chart.resize();
      });
      observer.observe(chartRef.current);
    }

    initChart();

    return () => {
      disposed = true;
      if (observer) observer.disconnect();
      if (chart) chart.dispose();
    };
  }, [colorMode]);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>T 型技能覆盖</h2>
        <p className={styles.subtitle}>全栈 AI Agent 开发 — 一专多能</p>
        <div className={styles.chartWrapper}>
          <div ref={chartRef} className={styles.chart} />
        </div>
      </div>
    </section>
  );
}

export default function SkillRadar() {
  return (
    <BrowserOnly fallback={<div className={styles.skeleton} />}>
      {() => <SkillRadarChart />}
    </BrowserOnly>
  );
}
