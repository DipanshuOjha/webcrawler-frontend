# WebCrawler: Visualize Your Web Structure

**WebCrawler** is a full-stack application that lets you crawl, analyze, and visualize the structure of any website. It combines a high-performance Go backend for crawling with a modern React + D3.js frontend for interactive graph visualization.

## Why WebCrawler?

- **Understand Website Architecture:** Instantly see how pages are linked and structured.
- **SEO & Site Audits:** Identify orphan pages, deep links, and crawl depth issues.
- **Educational Tool:** Great for learning about web graphs, crawling, and data visualization.
- **Performance:** Uses Go routines and DFS for fast, concurrent crawling.

---

## Features

- **Lightning-fast Crawling:** Powered by Go routines and depth-first search (DFS) for efficient, concurrent crawling.
- **Interactive D3.js Graphs:** Visualize the site structure as a dynamic, zoomable, and clickable graph.
- **Customizable Crawl:** Set crawl depth, concurrency, and output format.
- **Real-time Stats:** See crawl progress, duration, and link counts.
- **Export Data:** Download crawled links as CSV.

---

## How It Works

### 1. Backend (Go)

- **Repository:** [Web-Crawler-Backend](https://github.com/DipanshuOjha/Web-Crawler-Backend)
- **Concurrency:** Uses Go routines to crawl multiple pages in parallel.
- **Algorithm:** Employs DFS (Depth-First Search) for traversing the site graph, ensuring deep and efficient exploration.
- **API:** Exposes a REST endpoint (`/api/crawl`) that accepts a target URL, crawl depth, and concurrency level, returning a graph of links and parent relationships.

### 2. Frontend (React + D3.js)

- **Crawl Configuration:** Users input the target URL, depth, and concurrency.
- **Visualization:** Uses D3.js to render the crawl result as an interactive force-directed graph. Nodes represent pages, and edges represent links.
- **UI/UX:** Built with React, TailwindCSS, and Lucide icons for a modern, responsive experience.

---

## D3.js Visualization

- **Dynamic Graphs:** The frontend transforms crawl data into a graph structure and renders it using D3's force simulation.
- **Interactivity:** Hover to highlight connections, click nodes to open URLs, and zoom/pan the graph.
- **Color Coding:** Root nodes and different depths are visually distinguished for clarity.
- **Tooltip:** Shows URL and depth on hover.

---

## Installation & Local Development

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Go** (for backend, see [backend repo](https://github.com/DipanshuOjha/Web-Crawler-Backend))

### 1. Clone the Repositories

```bash
# Frontend
git clone https://github.com/your-username/web-crawler-frontend.git
cd web-crawler-frontend/project

# Backend (in a separate terminal)
git clone https://github.com/DipanshuOjha/Web-Crawler-Backend.git
cd Web-Crawler-Backend
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Backend

- Follow the instructions in the [Web-Crawler-Backend](https://github.com/DipanshuOjha/Web-Crawler-Backend) README.
- Start the Go server (usually `go run main.go`).

### 4. Set Backend URL for Frontend

- Create a `.env` file in `project/` with:
  ```
  VITE_BACKEND_URL=http://localhost:8080
  ```

### 5. Run the Frontend

```bash
npm run dev
# or
yarn dev
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
project/
  src/
    components/
      LandingPage.tsx         # Home/intro page
      Dashboard.tsx           # Crawl config & results
      GraphVisualization.tsx  # D3.js graph rendering
      CrawlStats.tsx          # Crawl statistics
    data/
    types/
    utils/
      graphUtils.ts           # Data transformation for D3
    index.css
    main.tsx
  index.html
  package.json
  tailwind.config.js
  ...
```

---

## Technologies Used

- **Frontend:** React, TypeScript, D3.js, TailwindCSS, Lucide Icons, Axios, Vite
- **Backend:** Go (Golang), Go routines, DFS, REST API

---

## About the Backend

- **Concurrency:** The backend leverages Go's lightweight goroutines to crawl multiple pages simultaneously, making the crawl process extremely fast and scalable.
- **DFS Algorithm:** Uses depth-first search to traverse the site, which is efficient for exploring deep site structures.
- **API Design:** Simple RESTful interface for integration with any frontend or tool.

For more details, see the [Web-Crawler-Backend](https://github.com/DipanshuOjha/Web-Crawler-Backend) repository.

---

## Screenshots

*(Add screenshots of the dashboard, graph visualization, and crawl results here for best effect!)*

---

## License

MIT

---

## Author

Made by Dipanshu Ojha 