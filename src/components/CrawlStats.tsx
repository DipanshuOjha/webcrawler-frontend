import React from 'react';
import { Clock, Link2, TreePine, AlertTriangle } from 'lucide-react';
import { CrawlResponse } from '../types';
import { transformCrawlDataToGraph } from '../utils/graphUtils';

interface CrawlStatsProps {
  crawlData: CrawlResponse;
}

const CrawlStats: React.FC<CrawlStatsProps> = ({ crawlData }) => {
  const graphData = transformCrawlDataToGraph(crawlData);
  const maxDepth = Math.max(...graphData.nodes.map(node => node.depth));
  const rootNodes = graphData.nodes.filter(node => node.isRoot);

  const stats = [
    {
      label: 'Total Links',
      value: crawlData.links.length,
      icon: Link2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20'
    },
    {
      label: 'Root Pages',
      value: rootNodes.length,
      icon: TreePine,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20'
    },
    {
      label: 'Max Depth',
      value: maxDepth,
      icon: TreePine,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20'
    },
    {
      label: 'Duration',
      value: `${crawlData.duration_seconds.toFixed(2)}s`,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600/20'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Crawl Statistics</h2>
      
      {crawlData.error && (
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-200 text-sm mt-1">{crawlData.error}</p>
        </div>
      )}

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-gray-300 text-sm">{stat.label}</span>
              </div>
              <span className="text-white font-bold text-lg">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Depth Distribution */}
      <div className="bg-black/40 rounded-lg p-4 border border-white/10 mt-6">
        <h3 className="text-white font-semibold mb-3">Depth Distribution</h3>
        <div className="space-y-2">
          {Array.from({ length: maxDepth + 1 }, (_, depth) => {
            const nodesAtDepth = graphData.nodes.filter(node => node.depth === depth).length;
            const percentage = (nodesAtDepth / graphData.nodes.length) * 100;
            
            return (
              <div key={depth} className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm w-16">Depth {depth}</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm w-8">{nodesAtDepth}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Breakdown */}
      <div className="bg-black/40 rounded-lg p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Domains</h3>
        <div className="space-y-2">
          {(() => {
            const domains = new Map<string, number>();
            crawlData.links.forEach(link => {
              try {
                const domain = new URL(link).hostname;
                domains.set(domain, (domains.get(domain) || 0) + 1);
              } catch {
                domains.set('Invalid URL', (domains.get('Invalid URL') || 0) + 1);
              }
            });

            return Array.from(domains.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([domain, count]) => (
                <div key={domain} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm truncate">{domain}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default CrawlStats;