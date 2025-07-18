const axios = require('axios');
const { get_encoding } = require('tiktoken');
const { encode: gptEncode } = require('gpt-3-encoder');

class LLMService {
  constructor() {
    this.models = {
      mistral: {                      
        name     : 'Mistral-7B-Instruct-Free',
        endpoint : 'https://openrouter.ai/api/v1/chat/completions',
        model_id : 'mistralai/mistral-7b-instruct:free',
        mode     : 'chat'                    
      },
      llama3: {                               
        name     : 'Llama 3.2 11B Vision Instruct',
        endpoint : 'https://openrouter.ai/api/v1/chat/completions',
        model_id : 'meta-llama/llama-3.2-11b-vision-instruct:free',
        mode     : 'chat'
      }
    };

    this.tokenizer = get_encoding('cl100k_base');
  }

  async generateResponse(modelKey, prompt, opts = {}) {
    const model      = this.models[modelKey];
    if (!model) throw new Error(`Model ${modelKey} not registered`);
    const { max_tokens = 512, temperature = 0.7 } = opts;

    const payload = {
      model     : model.model_id,
      messages  : [{ role: 'user', content: prompt }],
      max_tokens,
      temperature
    };

    const { data } = await axios.post(
      model.endpoint,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30_000
      }
    );

    const text = data.choices?.[0]?.message?.content?.trim() || '';

    const inputTokens  = this.countTokens(prompt);
    const outputTokens = this.countTokens(text);

    return {
      text,
      usage: {
        prompt_tokens:     inputTokens,
        completion_tokens: outputTokens,
        total_tokens:      inputTokens + outputTokens
      }
    };
  }

  countTokens(text, modelKey = 'gptj') {
    if (modelKey === 'gptj') return gptEncode(text).length;
    return this.tokenizer.encode(text).length;
  }
}

module.exports = new LLMService();