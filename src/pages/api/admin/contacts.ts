import type { APIRoute } from 'astro';
import { getContactSubmissions } from '../../../lib/database';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const result = await getContactSubmissions();
    
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get contacts error:', error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};