// src/server.js  (add at top if not already present)
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const llmService     = require('./services/llmService');
const loggingService = require('./services/loggingService');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60_000, max: 100 }));

/*------------------------------------------------------------------
  POST /api/generate         – single OR multi-model
------------------------------------------------------------------*/
app.post('/api/generate', async (req, res, next) => {
  try {
    /* ---------- 1. parse & validate body ---------- */
    const {
      prompt,
      model      = 'mistral',    // default
      max_tokens = 512,
      temperature = 0.7
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    const allowedModels = ['mistral', 'llama3'];   // add more if you register them
    const models = Array.isArray(model) ? model : [model];

    if (models.length === 0 || models.length > 2)
      return res.status(400).json({ error: 'You must request 1–2 models.' });

    const bad = models.filter(m => !allowedModels.includes(m));
    if (bad.length)
      return res.status(400).json({ error: `Invalid model(s): ${bad.join(', ')}` });

    /* ---------- 2. fan-out in parallel ---------- */
    const results = await Promise.all(
      models.map(async m => {
        const branchStart = Date.now();
        const llmResp     = await llmService.generateResponse(m, prompt, {
          max_tokens,
          temperature
        });

        const latency = Date.now() - branchStart;
        const reqId   = uuidv4();

        // write one CSV row per model
        await loggingService.logResponse(reqId, {
          prompt,
          response     : llmResp.text,
          latency,
          inputTokens  : llmResp.usage.prompt_tokens,
          outputTokens : llmResp.usage.completion_tokens,
          totalTokens  : llmResp.usage.total_tokens,
          model        : m,
          success      : true
        });

        return {
          model      : m,
          text       : llmResp.text,
          usage      : llmResp.usage,
          latency_ms : latency,
          request_id : reqId
        };
      })
    );

    /* ---------- 3. consolidated response ---------- */
    return res.json({
      prompt,
      results,                              // array (length 1 or 2)
      max_latency_ms: Math.max(...results.map(r => r.latency_ms))
    });
  } catch (err) {
    next(err);
  }
});

/* ---------- global error handler ---------- */
app.use((err, _req, res, _next) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

/* ---------- start server when run directly ---------- */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🟢  API listening on ${PORT}`));
}

module.exports = app;   // for tests
