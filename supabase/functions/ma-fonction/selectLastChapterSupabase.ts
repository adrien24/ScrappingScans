import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://ajtyenefvkagyajggfrv.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdHllbmVmdmthZ3lhamdnZnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTgyNTgsImV4cCI6MjA2MTU5NDI1OH0.-nD9MrWPJ5PWiUZRIQs-vTqklTWGkKIbHeZcuLvlcFc'

const supabase = createClient(supabaseUrl, supabaseKey)

export const selectLastChapterSupabase = async () => {
  const { data: OnePiece, error } = await supabase
    .from('OnePiece')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  return OnePiece.id
}
