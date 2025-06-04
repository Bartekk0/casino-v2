import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const result = Math.floor(Math.random() * 37);
  return json({ number: result });
};