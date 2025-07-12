import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Load .env during local/dev

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ---------- TYPES ----------
interface EnrollmentSubmission {
  course_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_level?: string;
  learning_goals?: string;
  is_free: boolean;
}

interface ContactSubmission {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  course_interest?: string;
  message: string;
}

// ---------- ENROLLMENT ----------
export async function submitEnrollmentForm(
  data: EnrollmentSubmission
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('enrollment_submissions')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE ERROR - submitEnrollmentForm]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error('[submitEnrollmentForm ERROR]', err.message || err);
    return { success: false, error: 'Unexpected server error' };
  }
}

export async function getEnrollmentSubmissions(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('enrollment_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SUPABASE ERROR - getEnrollmentSubmissions]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[getEnrollmentSubmissions ERROR]', err.message || err);
    return { success: false, error: 'Unexpected server error' };
  }
}

// ---------- CONTACT ----------
export async function submitContactForm(data: ContactSubmission): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('contact_submissions')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE ERROR - submitContactForm]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error('[submitContactForm ERROR]', err.message || err);
    return { success: false, error: 'Unexpected server error' };
  }
}

export async function getContactSubmissions(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SUPABASE ERROR - getContactSubmissions]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[getContactSubmissions ERROR]', err.message || err);
    return { success: false, error: 'Unexpected server error' };
  }
}

// ---------- STATUS UPDATE ----------
export async function updateSubmissionStatus(
  id: string,
  newStatus: string,
  type: 'contact' | 'enrollment'
): Promise<{ success: boolean; error?: string }> {
  try {
    const table = type === 'contact' ? 'contact_submissions' : 'enrollment_submissions';

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('[SUPABASE ERROR - updateSubmissionStatus]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[updateSubmissionStatus ERROR]', err.message || err);
    return { success: false, error: 'Unexpected server error' };
  }
}
