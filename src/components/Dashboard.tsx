import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowLeft, Play, RotateCcw, Settings, Download, FileText} from 'lucide-react';
import GraphVisualization from './GraphVisualization';
import CrawlStats from './CrawlStats';
//import { mockCrawlResponse, largeMockCrawlResponse } from '../data/mockData';
import { CrawlResponse, CrawlRequest } from '../types';
import axios from 'axios';


const api = import.meta.env.VITE_BACKEND_URL;

const Dashboard: React.FC = () => {
  // console.log(api);
  const [crawlRequest, setCrawlRequest] = useState<CrawlRequest>({
    url: 'https://example.com',
    depth: 3,
    concurrency: 5,
    output: 'console'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [crawlData, setCrawlData] = useState<CrawlResponse | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<'small' | 'large'>('small');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof CrawlRequest, value: string | number) => {
    setCrawlRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCrawl = async () => {
  setIsLoading(true);
  console.log("Starting to fetch the details....");
  
  try {
    const response = await axios.post(`${api}/api/crawl`, crawlRequest, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status !== 200) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    console.log("✅ Data received:", response.data);
    setCrawlData(response.data);

  } catch (error) {
    console.log("❌ Encountered error:", error);
    alert(`Error generating data:\n${error}`);
  }

  setIsLoading(false);
};

  const handleReset = () => {
    setCrawlData(null);
    setCrawlRequest({
      url: 'https://example.com',
      depth: 3,
      concurrency: 5,
      output: 'console'
    });
  };

  const outputFormats = [
    { value: 'console', label: 'CSV', icon: FileText },
  ];

  const handleCSVexport = ()=>{
       if (!crawlData || !crawlData.parent_urls) {
    alert("No crawl data available to export.");
    return;
  }

   console.log("🧠 Total Links to Export:", crawlData.links.length)

  const header = ["URL"];
  const rows = crawlData.links.map(link => {
    // Ensure commas/quotes don't break CSV
    const safeLink = `"${link.replace(/"/g, '""')}"`;
    return [safeLink];
  });

  const csvString = [header, ...rows].map(row => row.join(",")).join("\r\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const linkEl = document.createElement("a");
  linkEl.setAttribute("href", url);
  linkEl.setAttribute("download", "site_structure.csv");
  document.body.appendChild(linkEl);
  linkEl.click();
  document.body.removeChild(linkEl);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">WebCrawler</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Dashboard
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Crawler Configuration</h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  id="url"
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-300 mb-2">
                  Crawl Depth: {crawlRequest.depth}
                </label>
                <input
                  type="range"
                  id="depth"
                  min="1"
                  max="10"
                  value={crawlRequest.depth}
                  onChange={(e) => handleInputChange('depth', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 (Shallow)</span>
                  <span>10 (Deep)</span>
                </div>
              </div>
            </div>

            {/* Advanced Configuration */}
            <div className={`space-y-4 transition-all duration-300 ${showAdvanced ? 'opacity-100' : 'opacity-50'}`}>
              <div>
                <label htmlFor="concurrency" className="block text-sm font-medium text-gray-300 mb-2">
                  Concurrency: {crawlRequest.concurrency}
                </label>
                <input
                  type="range"
                  id="concurrency"
                  min="1"
                  max="40"
                  value={crawlRequest.concurrency}
                  onChange={(e) => handleInputChange('concurrency', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isLoading || !showAdvanced}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 (Slow)</span>
                  <span>40 (Fast)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {outputFormats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => handleInputChange('output', format.value)}
                      disabled={isLoading || !showAdvanced}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        crawlRequest.output === format.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      } ${(!showAdvanced || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <format.icon className="h-4 w-4" />
                      <span>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Dataset Selection */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium mb-1">Demo Mode</h3>
                <p className="text-gray-400 text-sm">Select a dataset to preview the visualization</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedDataset('small')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedDataset === 'small'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                    disabled={isLoading}
                  >
                    Small Dataset (16 links)
                  </button>
                  <button
                    onClick={() => setSelectedDataset('large')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedDataset === 'large'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                    disabled={isLoading}
                  >
                    Large Dataset (29 links)
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCrawl}
                    disabled={isLoading || !crawlRequest.url}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" />
                    <span>{isLoading ? 'Crawling...' : 'Start Crawl'}</span>
                  </button>
                  
                  {crawlData && (
                    <button
                      onClick={handleReset}
                      className="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-medium mb-3">Configuration Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">URL</div>
                  <div className="text-white font-medium truncate">{crawlRequest.url}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Max Depth</div>
                  <div className="text-white font-medium">{crawlRequest.depth} levels</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Concurrency</div>
                  <div className="text-white font-medium">{crawlRequest.concurrency} threads</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400">Output</div>
                  <div className="text-white font-medium">{crawlRequest.output.toUpperCase()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-white text-lg">Crawling website...</span>
            </div>
            <p className="text-gray-400 mt-2">
              Discovering links with depth {crawlRequest.depth} and {crawlRequest.concurrency} concurrent threads
            </p>
          </div>
        )}

        {/* Results */}
        {crawlData && !isLoading && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Stats Panel */}
            <div className="xl:col-span-1">
              <CrawlStats crawlData={crawlData} />
            </div>
            
            {/* Visualization Panel */}
            <div className="xl:col-span-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Site Structure</h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-400">
                      Interactive D3.js Visualization
                    </div>
                    <button onClick={handleCSVexport} className="flex items-center space-x-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
                <GraphVisualization crawlData={crawlData} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!crawlData && !isLoading && (
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
            <Globe className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Crawl</h3>
            <p className="text-gray-400 mb-6">Configure your crawl parameters above and click "Start Crawl" to begin visualizing the website structure.</p>
            <div className="text-sm text-gray-500">
              This demo uses mock data to demonstrate the visualization capabilities.
            </div>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;