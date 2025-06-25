import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CrawlResponse, GraphData, GraphNode, GraphLink } from '../types';
import { transformCrawlDataToGraph, getUrlDisplayName } from '../utils/graphUtils';

interface GraphVisualizationProps {
  crawlData: CrawlResponse;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ crawlData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !crawlData) return;

    const graphData = transformCrawlDataToGraph(crawlData);
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 600;
    
    svg.attr('width', width).attr('height', height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create arrow markers for directed links
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64748b');

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(80)
        .strength(0.8))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Create nodes
    const nodes = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('r', d => d.isRoot ? 12 : 8)
      .attr('fill', d => {
        if (d.isRoot) return '#3b82f6';
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        return colors[d.depth % colors.length];
      })
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Create labels
    const labels = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter().append('text')
      .text(d => getUrlDisplayName(d.url))
      .attr('font-size', '10px')
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add hover effects
    nodes
      .on('mouseover', function(event, d) {
        // Highlight connected nodes and links
        const connectedNodes = new Set<string>();
        connectedNodes.add(d.id);
        
        graphData.links.forEach(link => {
          if (link.source === d.id || link.target === d.id) {
            connectedNodes.add(typeof link.source === 'string' ? link.source : link.source.id);
            connectedNodes.add(typeof link.target === 'string' ? link.target : link.target.id);
          }
        });

        nodes
          .style('opacity', node => connectedNodes.has(node.id) ? 1 : 0.3)
          .attr('r', node => {
            if (node.id === d.id) return node.isRoot ? 15 : 12;
            return node.isRoot ? 12 : 8;
          });

        links
          .style('opacity', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
          })
          .attr('stroke-width', link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            return (sourceId === d.id || targetId === d.id) ? 3 : 2;
          });

        labels.style('opacity', node => connectedNodes.has(node.id) ? 1 : 0.3);

        // Show tooltip
        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current);
          tooltip
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
              <div class="font-semibold text-white">${d.isRoot ? '🏠 ' : ''}${getUrlDisplayName(d.url)}</div>
              <div class="text-gray-300 text-sm">Depth: ${d.depth}</div>
              <div class="text-gray-400 text-xs mt-1 max-w-xs break-all">${d.url}</div>
            `);
        }
      })
      .on('mouseout', function() {
        nodes
          .style('opacity', 1)
          .attr('r', d => d.isRoot ? 12 : 8);
        
        links
          .style('opacity', 0.6)
          .attr('stroke-width', 2);
        
        labels.style('opacity', 1);

        // Hide tooltip
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0);
        }
      })
      .on('click', function(event, d) {
        // Open URL in new tab
        window.open(d.url, '_blank');
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y! + 20);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [crawlData]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full border border-white/10 rounded-lg bg-slate-950/50"
        style={{ minHeight: '600px' }}
      />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-sm opacity-0 transition-opacity z-10"
        style={{ maxWidth: '200px' }}
      />
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Node</span>
        </div>
        <div className="text-gray-400">
          Click nodes to open URLs
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;