import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import type { Env } from './config.js';

const testEnv: Env = {
  NODE_ENV: 'test',
  PORT: 4000,
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/university_test',
  JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
  JWT_EXPIRES_IN: '1h',
  UPLOAD_DIR: './test-uploads',
  CLIENT_ORIGIN: 'http://localhost:5173',
};

describe('createApp', () => {
  it('responds on /health', async () => {
    const app = createApp(testEnv);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
