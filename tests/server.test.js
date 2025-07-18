const request = require('supertest');
const app     = require('../src/server');

/* -- For unit tests we mock axios so we don't hit the real API -- */
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      choices: [{ text: 'Mock reply' }]
    }
  })
}));

describe('LLM Multi-Model Service', () => {
  describe('/api/generate', () => {
    it('should reject when prompt is missing', async () => {
      const res = await request(app).post('/api/generate').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Prompt is required/);
    });

    it('should reject invalid model', async () => {
      const res = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Hi', model: 'bad_model' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Invalid model/);
    });

    it('should succeed with default model', async () => {
      const res = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Hello world' });
      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe('Mock reply');
      expect(res.body.model).toBe('gptj');
    });
  });
});