import { supabase } from '../../supabaseClient'

export const getMangasInSupabase = async (title: string) => {
  try {
    const { data: mangas, error } = await supabase
      .from('Mangas')
      .select(
        `
    title,
    Scans (
      title
    )
  `,
      )
      .eq('title', title)
    console.log(JSON.stringify(mangas))
  } catch (error) {
    console.error('Error in getMangasInSupabase:', error)
  }
}
