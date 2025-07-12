import type { APIRoute } from 'astro';
import { updateSubmissionStatus } from '../../../lib/database';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, status, type } = await request.json();
    
    if (!id || !status || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await updateSubmissionStatus(id, status, type);
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
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
    console.error('Error updating status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};