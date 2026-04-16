import axios from 'axios';
import { env } from './env.js';

const http = axios.create({
  baseURL: env.aiOrchestratorUrl,
  timeout: env.aiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function requestChat(payload) {
  const { data } = await http.post('/chat', payload);
  return data;
}