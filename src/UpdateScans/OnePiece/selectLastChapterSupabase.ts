import dotenv from 'dotenv'
import { supabase } from '../../supabaseClient'

dotenv.config()

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
