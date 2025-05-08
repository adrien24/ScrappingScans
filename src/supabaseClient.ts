import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseEmail = process.env.SUPABASE_EMAIL;
const supabasePassword = process.env.SUPABASE_PASSWORD;

if (!supabaseUrl || !supabaseKey || !supabaseEmail || !supabasePassword) {
  throw new Error('Missing Supabase URL or Key or Email or Password');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const connectUser = async () => {
const { data, error } = await supabase.auth.signInWithPassword({
    email: supabaseEmail,
    password: supabasePassword
  });
  
  if (error) {
    console.error('Échec de la connexion :', error.message);
  } else {
    console.log('Utilisateur connecté :', data.user.email);
  }}
