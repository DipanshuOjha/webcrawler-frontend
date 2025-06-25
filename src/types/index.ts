export interface CrawlResponse {
  links: string[];
  parent_urls: Record<string, string>;
  duration_seconds: number;
  error?: string;
}

export interface CrawlRequest {
  url: string;
  depth: number;
  concurrency: number;
  output: string;
}

export interface GraphNode {
  id: string;
  url: string;
  isRoot?: boolean;
  depth: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}