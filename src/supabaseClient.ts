import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const connectUser = async () => {
const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_EMAIL!,
    password: process.env.SUPABASE_PASSWORD!
  });
  
  if (error) {
    console.error('Échec de la connexion :', error.message);
  } else {
    console.log('Utilisateur connecté :', data.user);
  }}
