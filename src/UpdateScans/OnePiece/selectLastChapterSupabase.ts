import dotenv from 'dotenv'
import { supabase } from '../../supabaseClient'

dotenv.config()

export const selectLastChapterSupabase = async () => {
  const { data: OnePiece } = await supabase
    .from('Scans')
    .select('chapter')
    .eq('scan_id', 'One Piece')
    .order('chapter', { ascending: false })
    .limit(1)
    .single()
  if (!OnePiece) return new Error('No data found')
  return OnePiece.chapter
}
