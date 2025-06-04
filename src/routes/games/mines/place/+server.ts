import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const bombCount = parseInt(url.searchParams.get('bombs') || '5');

  if (bombCount > 25) {
    return json({ error: 'Too many bombs' }, { status: 400 });
  }

  const indices: number[] = [];

  while (indices.length < bombCount) {
    const rand = Math.floor(Math.random() * 25);
    if (!indices.includes(rand)) {
      indices.push(rand);
    }
  }

  return json({ bombs: indices });
};
