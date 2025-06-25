import { CrawlResponse, GraphData, GraphNode, GraphLink } from '../types';

export function transformCrawlDataToGraph(crawlData: CrawlResponse): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Find root nodes (nodes that are not in parent_urls)
  const childUrls = new Set(Object.keys(crawlData.parent_urls));
  const rootUrls = crawlData.links.filter(url => !childUrls.has(url));

  // Create nodes with depth calculation
  crawlData.links.forEach(url => {
    const depth = calculateDepth(url, crawlData.parent_urls);
    const isRoot = rootUrls.includes(url);
    
    const node: GraphNode = {
      id: url,
      url,
      isRoot,
      depth
    };
    
    nodes.push(node);
    nodeMap.set(url, node);
  });

  // Create links from parent-child relationships
  Object.entries(crawlData.parent_urls).forEach(([child, parent]) => {
    if (nodeMap.has(parent) && nodeMap.has(child)) {
      links.push({
        source: parent,
        target: child
      });
    }
  });

  return { nodes, links };
}

function calculateDepth(url: string, parentUrls: Record<string, string>): number {
  let depth = 0;
  let currentUrl = url;
  
  while (parentUrls[currentUrl]) {
    depth++;
    currentUrl = parentUrls[currentUrl];
    
    // Prevent infinite loops
    if (depth > 20) break;
  }
  
  return depth;
}

export function getUrlDisplayName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length === 0) {
      return urlObj.hostname;
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.length > 20 ? lastPart.substring(0, 17) + '...' : lastPart;
  } catch {
    return url.length > 20 ? url.substring(0, 17) + '...' : url;
  }
}