const allowedModels = ['mistral', 'llama3'];   

function validatePrompt(req, res, next) {
  const { prompt, model } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }

  if (model && !allowedModels.includes(model)) {
    return res.status(400).json({ error: `Invalid model: ${model}. Allowed: ${allowedModels.join(', ')}` });
  }

  next();
}

module.exports = validatePrompt;