import type { APIRoute } from 'astro';
import { submitEnrollmentForm } from '../../lib/database';

export const POST: APIRoute = async ({ request }) => {

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.courseId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate experience level
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (data.experience && !validLevels.includes(data.experience)) {
      return new Response(JSON.stringify({ error: 'Invalid experience level' }), {
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
      experience_level: data.experience || 'beginner',
      learning_goals: data.goals || '',
      is_free: data.isFree === 'true',
    };


    // Submit to Supabase database
    const result = await submitEnrollmentForm(enrollmentData);

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
    console.error('Enrollment API error:', error.message || error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

