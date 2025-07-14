import type { APIRoute } from 'astro';
import { getEnrollmentSubmissions } from '../../../lib/database';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const result = await getEnrollmentSubmissions();
    
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get enrollments error:', error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};