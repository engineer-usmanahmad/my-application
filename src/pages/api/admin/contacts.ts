import type { APIRoute } from 'astro';
import { getContactSubmissions } from '../../../lib/database';

export const GET: APIRoute = async () => {
  try {
    const result = await getContactSubmissions();
    
    if (result.success) {
      return new Response(JSON.stringify(result.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch submissions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};