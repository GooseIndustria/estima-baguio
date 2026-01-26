
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Missing Supabase Credentials') }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: () => Promise.reject(new Error('Missing Supabase Credentials')),
            signUp: () => Promise.reject(new Error('Missing Supabase Credentials')),
            signOut: () => Promise.resolve({ error: null }),
            resetPasswordForEmail: () => Promise.reject(new Error('Missing Supabase Credentials')),
            updateUser: () => Promise.reject(new Error('Missing Supabase Credentials')),
        },
        from: () => ({
            select: () => Promise.reject(new Error('Missing Supabase Credentials')),
        })
    };
