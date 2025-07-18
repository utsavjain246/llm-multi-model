# 🚀 Multi-Model LLM Gateway

A lightweight **Node.js + Express** API that lets you prompt multiple open-source large language models (LLMs) through a single endpoint.
Compare their responses, log token counts & latency, and analyze everything with CSV logs.

Currently supports:

- [Mistral 7B Instruct (OpenRouter Free)](https://openrouter.ai/docs/models/mistralai/mistral-7b-instruct)
- [Llama 3.2 11B Vision Instruct (OpenRouter Free)](https://openrouter.ai/meta-llama/llama-3.2-11b-vision-instruct:free).
  <br>
  Easily extend to support any OpenRouter-compatible LLM.

---

## 🌟 Features

- **Unified endpoint:** Send your prompt to one or two models per request
- **Multi-model switcher:** Test, compare, or benchmark LLMs side-by-side
- **Latency & token logging:** Track prompt/response time, token counts, and success in a CSV
- **Easy API Key setup:** Just one OpenRouter key required
- **Ready to extend:** Add new models and endpoints with minimal changes

---

## 🚧 Prerequisites

- **Node.js 18+**
- A free [OpenRouter account & API key](https://openrouter.ai/)
- (Optional) [`curl`](https://curl.se/) or [Postman](https://www.postman.com/) for testing

---

## ⚡ Setup & Run

### 1. Clone and install dependencies

git clone https://github.com/utsavjain246/llm-multi-model
cd llm-multi-model
npm install

### 2· environment

cp .env.example .env # then paste your openrouter key

### 3· run

npm run dev # nodemon

### 4· probe (single model)
<pre>

  curl -X POST http://localhost:3000/api/generate
  -H "Content-Type: application/json"
  -d '{ "prompt":"Tell me a joke about AI.",
  "model" :"mistral",
  "max_tokens":40,
  "temperature":0.8 }'
  
</pre>


### 5· probe (two models at once)

<pre>
  curl -X POST http://localhost:3000/api/generate
  -H "Content-Type: application/json"
  -d '{ "prompt":"Give me a haiku on resilience.",
  "model":["mistral","llama3"],
  "max_tokens":64 }'
</pre>



---

## API Reference

### POST `/api/generate`

| Field         | Type               | Required | Notes                                             |
| ------------- | ------------------ | -------- | ------------------------------------------------- |
| `prompt`      | string             | ✅       | user message                                      |
| `model`       | string \| string[] | ✅       | `"mistral"` • `"llama3"` • `["mistral","llama3"]` |
| `max_tokens`  | number             | ⭕       | ≤ 4096 (default 512)                              |
| `temperature` | number             | ⭕       | 0-2 (default 0.7)                                 |

#### 1.1 · Response – single-model

<pre> {
  "text": "Quantum entanglement is ...",
  "model": "llama3",
  "usage": {
  "prompt_tokens": 8,
  "completion_tokens": 43,
  "total_tokens": 51
  },
  "latency_ms": 1572,
  "request_id": "0189f1d5-..."
} </pre>

#### 1.2 · Response – multi-model

<pre>
{
  "prompt": "Give me a haiku on resilience.",
  "results": [
  {
  "model": "mistral",
  "text": "...",
  "usage": { "prompt_tokens": 10, "completion_tokens": 28, "total_tokens": 38 },
  "latency_ms": 980,
  "request_id": "0189f20a-..."
  },
  {
  "model": "llama3",
  "text": "...",
  "usage": { "prompt_tokens": 10, "completion_tokens": 30, "total_tokens": 40 },
  "latency_ms": 1650,
  "request_id": "0189f20a-..."
  }
  ],
  "max_latency_ms": 1650
} 
</pre>

---

## Logging

Each model hit appends one row to `logs/api_logs.csv`:

| Column        | Example                          |
| ------------- | -------------------------------- |
| Request ID    | `0189f20a-2e…`                   |
| Timestamp     | `2025-07-18T09:12:54.123Z`       |
| Model         | `llama3`                         |
| Prompt        | `Give me a haiku on resilience.` |
| Response      | `Bold roots grip ancient...`     |
| Latency (ms)  | `1650`                           |
| Input Tokens  | `10`                             |
| Output Tokens | `30`                             |
| Total Tokens  | `40`                             |
| Success       | `true`                           |
| Error         | _(blank on success)_             |

---

## Troubleshooting

| Symptom                 | Likely Cause                             | Fix                                                        |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `401 Unauthorized`      | Missing / wrong `OPENROUTER_API_KEY`     | Update `.env`, restart                                     |
| `429 Too Many Requests` | Free-model rate limit (20 RPM / 200 RPD) | Wait, buy credits, or use the paid model ID (drop `:free`) |
| `400 Bad Request`       | `max_tokens` > 4096 or invalid model ID  | Lower token count / correct ID                             |
| No CSV rows             | No write permission or wrong path        | Ensure `logs/` exists & app can write                      |

## Project Structure
<pre>
llm-gateway/
├── logs/
│   └── api_logs.csv
├── src/
│   ├── server.js
│   ├── middleware/
│   │   ├── validation.js
│   │   └── errorHandler.js
│   └── services/
│       ├── llmService.js
│       └── loggingService.js
├── tests/
│   └── server.test.js
├── .env.example
├── package.json
└── README.md</pre>


