import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ArticleNode from './nodes/ArticleNode';
import styles from './index.module.css';

const nodeTypes = { article: ArticleNode };

const pathColors = {
  beginner: '#52c41a',
  core: '#1890ff',
  llm: '#722ed1',
  frontend: '#eb2f96',
  backend: '#fa8c16',
  project: '#f5222d',
};

function buildGraph(learningPaths, dependencies, layout) {
  const nodes = [];
  const edges = [];
  const pathIds = Object.keys(learningPaths);

  // Column-based layout: each path is a column
  pathIds.forEach((pathId, colIndex) => {
    const path = learningPaths[pathId];
    path.articles.forEach((article, rowIndex) => {
      nodes.push({
        id: article.docId,
        type: 'article',
        position: {
          x: colIndex * (layout.colWidth + layout.gapX),
          y: rowIndex * (layout.rowHeight + layout.gapY),
        },
        data: {
          label: article.title,
          docId: article.docId,
          pathId,
          pathName: path.name,
        },
      });
    });
  });

  dependencies.forEach(({ from, to }) => {
    edges.push({
      id: `${from}→${to}`,
      source: from,
      target: to,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#aaa', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#aaa' },
    });
  });

  return { nodes, edges };
}

export default function KnowledgeGraph({ learningPaths, dependencies, layout }) {
  const defaultLayout = {
    colWidth: 200,
    rowHeight: 70,
    gapX: 60,
    gapY: 20,
    ...layout,
  };

  const initial = useMemo(
    () => buildGraph(learningPaths, dependencies, defaultLayout),
    [learningPaths, dependencies, defaultLayout],
  );

  const [nodes, , onNodesChange] = useNodesState(initial.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initial.edges);

  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background gap={20} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}
