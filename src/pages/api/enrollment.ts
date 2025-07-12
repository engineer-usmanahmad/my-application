import type { APIRoute } from 'astro';
import { submitEnrollmentForm } from '../../lib/database';

export const POST: APIRoute = async ({ request }) => {
  console.log('[ENROLLMENT API] Route triggered');

  try {
    const data = await request.json();
    console.log('[ENROLLMENT API] Request body:', data);

    // ✅ Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.courseId) {
      console.warn('[ENROLLMENT API] Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.warn('[ENROLLMENT API] Invalid email format:', data.email);
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const enrollmentData = {
      course_id: data.courseId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      experience_level: data.experience,
      learning_goals: data.goals,
      is_free: data.isFree === 'true',
    };

    console.log('[ENROLLMENT API] Submitting to DB:', enrollmentData);

    // ✅ Submit to Supabase (via your database.ts)
    const result = await submitEnrollmentForm(enrollmentData);
    console.log('[ENROLLMENT API] DB response:', result);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Enrollment submitted successfully',
          id: result.data.id,
          status: result.data.status,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error(result.error || 'Unknown DB error');
    }
  } catch (error: any) {
    console.error('[ENROLLMENT API ERROR]', error.message || error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

