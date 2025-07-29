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

export const getAllMangasInSupabase = async () => {
  try {
    const { data: mangas, error } = await supabase
      .from('Mangas')
      .select(`title, Scans (chapter), linkManga`)
      .eq('site', 'lelmanga')
    if (error) {
      throw new Error(`Error fetching mangas: ${error.message}`)
    }
    return mangas
  } catch (error) {
    console.error('Error in getAllMangasInSupabase:', error)
    throw error
  }
}

export const getSelectedMangasInSupabase = async (title: string) => {
  try {
    const { data: manga } = await supabase.from('Mangas').select('*').eq('title', title)
    if (!manga) throw new Error(`Manga with title ${title} not found in Supabase`)
    return manga[0].title
  } catch (error) {
    throw new Error(`Error fetching mangas: ${error}`)
  }
}
