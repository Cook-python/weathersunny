import { getStore } from '@netlify/blobs';

const STORE_NAME = 'site-stats';
const KEY = 'views';

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function reply(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export default async (req) => {
  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (error) {
    return reply({ available: false, total: 0, today: 0 });
  }

  let data = null;
  try {
    data = await store.get(KEY, { type: 'json' });
  } catch (error) {
    data = null;
  }

  if (!data || typeof data.total !== 'number') {
    data = { total: 0, date: stamp(), day: 0 };
  }

  const day = stamp();
  if (data.date !== day) {
    data.date = day;
    data.day = 0;
  }

  let saved = true;
  if (req.method === 'POST') {
    data.total += 1;
    data.day += 1;
    try {
      await store.setJSON(KEY, data);
    } catch (error) {
      saved = false;
    }
  }

  return reply({ available: true, saved: saved, total: data.total, today: data.day });
};

export const config = { path: '/api/views' };
