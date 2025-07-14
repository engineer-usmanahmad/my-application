import { supabase } from './supabase';

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  course_interest: string;
  message: string;
}

export interface EnrollmentFormData {
  course_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  learning_goals: string;
  is_free: boolean;
}

export async function submitContactForm(data: ContactFormData) {
  try {
    console.log('submitContactForm called with data:', {
      ...data,
      message: data.message ? 'Present' : 'Missing'
    });
    
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!data[field as keyof ContactFormData]) {
        console.error(`❌ Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error('❌ Invalid email format:', data.email);
      throw new Error('Invalid email format');
    }

    console.log('✅ Validation passed, inserting into Supabase...');
    
    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('contact_submissions')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || '',
        course_interest: data.course_interest || 'General',
        message: data.message,
        status: 'new'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insertion error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Contact form submitted successfully:', result?.id);
    
    return {
      success: true,
      data: result,
      message: 'Contact form submitted successfully'
    };

  } catch (error) {
    console.error('❌ Contact form submission error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function submitEnrollmentForm(data: EnrollmentFormData) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Validate required fields
    const requiredFields = ['course_id', 'first_name', 'last_name', 'email', 'phone', 'experience_level'];
    for (const field of requiredFields) {
      if (!data[field as keyof EnrollmentFormData]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Validate experience level
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(data.experience_level)) {
      throw new Error('Invalid experience level');
    }

    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('enrollment_submissions')
      .insert([{
        course_id: data.course_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        experience_level: data.experience_level,
        learning_goals: data.learning_goals || '',
        is_free: data.is_free || false,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data: result,
      message: 'Enrollment submitted successfully'
    };

  } catch (error) {
    console.error('Enrollment submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function updateSubmissionStatus(id: number, status: string, type: 'contact' | 'enrollment') {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const tableName = type === 'contact' ? 'contact_submissions' : 'enrollment_submissions';
    
    const { data, error } = await supabase
      .from(tableName)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: 'Status updated successfully'
    };

  } catch (error) {
    console.error('Status update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function getContactSubmissions() {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      message: 'Contact submissions retrieved successfully'
    };

  } catch (error) {
    console.error('Get contact submissions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}

export async function getEnrollmentSubmissions() {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('enrollment_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      message: 'Enrollment submissions retrieved successfully'
    };

  } catch (error) {
    console.error('Get enrollment submissions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}