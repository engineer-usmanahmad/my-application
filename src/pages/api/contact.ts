import type { APIRoute } from 'astro';
import { submitContactForm } from '../../lib/database';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Read request body as text first to handle empty/malformed JSON
    const bodyText = await request.text();
    
    if (!bodyText || bodyText.trim() === '') {
      return new Response(JSON.stringify({ error: 'Request body is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Submit to database
    const result = await submitContactForm({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      course_interest: data.course,
      message: data.message
    });

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        id: result.data.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

