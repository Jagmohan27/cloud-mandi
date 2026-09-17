import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code2, ShieldAlert } from 'lucide-react';

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState('curl');
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/prices',
      desc: 'Query paginated mandi prices with multi-dimensional filtering (state, district, commodity, variety, date, sort_by).',
      params: 'commodity=Wheat&state=Uttar%20Pradesh&page=1&limit=20',
      curl: `curl -X GET "http://localhost:8000/api/prices?commodity=Wheat&state=Uttar%20Pradesh&limit=2" \\
  -H "Accept: application/json"`,
      js: `// Fetch mandi prices in JavaScript / Node.js
const response = await fetch(
  'http://localhost:8000/api/prices?commodity=Wheat&state=Uttar%20Pradesh&limit=2'
);
const data = await response.json();
console.log(data.results);`,
      python: `# Fetch mandi prices in Python
import requests

url = "http://localhost:8000/api/prices"
params = {
    "commodity": "Wheat",
    "state": "Uttar Pradesh",
    "limit": 2
}
response = requests.get(url, params=params)
data = response.json()
print(f"Total found: {data['count']}")
for item in data['results']:
    print(f"{item['mandi']}: ₹{item['modal_price']}/Q")`,
      response: `{
  "count": 128,
  "page": 1,
  "limit": 2,
  "total_pages": 64,
  "results": [
    {
      "id": 14,
      "commodity": "Wheat",
      "variety": "Local",
      "grade": "FAQ",
      "state": "Uttar Pradesh",
      "district": "Badaun",
      "mandi": "Bisauli",
      "minimum_price": 2200.0,
      "maximum_price": 2450.0,
      "modal_price": 2350.0,
      "date": "2026-09-17",
      "source": "data.gov.in / AGMARKNET"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/prices/history',
      desc: 'Retrieve time-series price data for a commodity over a 7, 30, 90, or 365-day interval.',
      params: 'commodity=Onion&days=30',
      curl: `curl -X GET "http://localhost:8000/api/prices/history?commodity=Onion&days=30" \\
  -H "Accept: application/json"`,
      js: `const res = await fetch('http://localhost:8000/api/prices/history?commodity=Onion&days=30');
const data = await res.json();
console.log(data.history);`,
      python: `import requests

res = requests.get("http://localhost:8000/api/prices/history", params={"commodity": "Onion", "days": 30})
trends = res.json()["history"]
for day in trends[-5:]:
    print(day["date"], day["modal_price"])`,
      response: `{
  "commodity": "Onion",
  "mandi": null,
  "district": null,
  "state": null,
  "range_days": 30,
  "history": [
    {
      "date": "2026-08-18",
      "modal_price": 2380.0,
      "minimum_price": 2210.0,
      "maximum_price": 2550.0
    },
    {
      "date": "2026-09-17",
      "modal_price": 2420.0,
      "minimum_price": 2250.0,
      "maximum_price": 2590.0
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/statistics',
      desc: 'Get high-level summary metrics of commodities, active mandis, and updates today.',
      params: '',
      curl: `curl -X GET "http://localhost:8000/api/statistics" -H "Accept: application/json"`,
      js: `const stats = await fetch('http://localhost:8000/api/statistics').then(r => r.json());
console.log(stats);`,
      python: `import requests
stats = requests.get("http://localhost:8000/api/statistics").json()
print("Total commodities:", stats["total_commodities"])`,
      response: `{
  "total_commodities": 142,
  "total_mandis": 3810,
  "total_price_records": 48200,
  "records_updated_today": 1250,
  "states_covered": 28,
  "districts_covered": 512,
  "latest_price_date": "2026-09-17"
}`
    },
    {
      method: 'GET',
      path: '/api/health',
      desc: 'Probe service and database health status.',
      params: '',
      curl: `curl -X GET "http://localhost:8000/api/health"`,
      js: `const health = await fetch('http://localhost:8000/api/health').then(r => r.json());`,
      python: `import requests
health = requests.get("http://localhost:8000/api/health").json()`,
      response: `{
  "status": "healthy",
  "database": "connected",
  "sync_in_progress": false,
  "service": "Mandi Price Cloud API",
  "timestamp": "2026-09-17T18:00:00Z"
}`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-200">
        <div>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Developer Documentation
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 mt-1">
            Mandi Price REST API
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Standards-compliant REST endpoints returning clean JSON payloads
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="http://localhost:8000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="apple-btn-primary px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2"
          >
            <span>Interactive Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
          Example Code Formats
        </div>
        <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200">
          {['curl', 'javascript', 'python'].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                activeLang === lang
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-10">
        {endpoints.map((ep, idx) => {
          const codeString = ep[activeLang];
          const copyId = `code-${idx}`;

          return (
            <div key={ep.path} className="apple-glass-card rounded-2xl overflow-hidden">
              {/* Endpoint Header */}
              <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-neutral-900 text-white">
                    {ep.method}
                  </span>
                  <span className="text-sm font-mono font-semibold text-neutral-900">
                    {ep.path}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 max-w-lg text-left sm:text-right">
                  {ep.desc}
                </p>
              </div>

              {/* Code Snippet & Response Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200/80">
                {/* Request Code */}
                <div className="p-5 bg-neutral-950 text-neutral-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 text-[11px] text-neutral-400 font-mono">
                    <span>Request Sample ({activeLang.toUpperCase()})</span>
                    <button
                      onClick={() => copyToClipboard(codeString, copyId)}
                      className="p-1 rounded hover:text-white transition-colors flex items-center space-x-1"
                    >
                      {copiedKey === copyId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono overflow-x-auto leading-relaxed text-neutral-100 py-1">
                    <code>{codeString}</code>
                  </pre>
                </div>

                {/* JSON Response Sample */}
                <div className="p-5 bg-[#18181B] text-neutral-300 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 text-[11px] text-neutral-400 font-mono">
                    <span>Response JSON (200 OK)</span>
                    <button
                      onClick={() => copyToClipboard(ep.response, `res-${idx}`)}
                      className="p-1 rounded hover:text-white transition-colors flex items-center space-x-1"
                    >
                      {copiedKey === `res-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono overflow-x-auto leading-relaxed text-emerald-400 py-1 max-h-56">
                    <code>{ep.response}</code>
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
