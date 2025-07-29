import { supabase } from '../../supabaseClient'
import type { Scan } from './index'

export const postScansToSupabase = async (scan: Scan, id: string) => {
  const scanFormatted = [
    {
      scan_id: id,
      chapter: scan.chapter,
      title: scan.title,
      description: '',
      images: scan.images,
      date: '',
    },
  ]

  console.log('scanFormatted:', scanFormatted)

  try {
    const { data, error } = await supabase.from('Scans').insert(scanFormatted).select()

    console.log('Data inserted successfully:', data, error)
  } catch (error) {
    console.error('Error posting scan to Supabase:', error)
  }
}
