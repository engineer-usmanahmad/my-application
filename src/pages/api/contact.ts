import type { APIRoute } from 'astro';
import { submitContactForm } from '../../lib/database';

export const POST: APIRoute = async ({ request }) => {
  console.log('Contact API endpoint called');
  
  try {
    // Check if request has content
    const contentLength = request.headers.get('content-length');
    console.log('Request content-length:', contentLength);
    
    if (!contentLength || contentLength === '0') {
      console.error('Empty request body received');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Request body is empty' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let data;
    try {
      data = await request.json();
      console.log('Parsed request data:', {
        ...data,
        message: data.message ? 'Present' : 'Missing'
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !data[field]?.trim());
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error('Invalid email format:', data.email);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare data for database
    const contactData = {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '',
      course_interest: data.course?.trim() || 'General',
      message: data.message.trim()
    };

    console.log('Submitting to database:', {
      ...contactData,
      message: 'Present'
    });

    // Submit to Supabase database
    const result = await submitContactForm(contactData);
    console.log('Database operation result:', {
      success: result.success,
      error: result.error,
      hasData: !!result.data
    });

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        id: result.data?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Database submission failed:', result.error);
      return new Response(JSON.stringify({
        success: false,
        error: result.error || 'Failed to submit contact form'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Contact API error:', error);
    
    // Provide detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error. Please try again or contact support.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};