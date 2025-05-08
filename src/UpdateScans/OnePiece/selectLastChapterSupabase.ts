import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = 'https://ajtyenefvkagyajggfrv.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY!
console.log('supabaseKey', supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

export const selectLastChapterSupabase = async () => {
  const { data: OnePiece } = await supabase
    .from('OnePiece')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single()
  if (!OnePiece) return new Error('No data found')
  return OnePiece.id
}
