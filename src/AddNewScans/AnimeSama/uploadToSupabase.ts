import { supabase } from '../../supabaseClient'
import { MALMangaSearchResponse } from './getMangaInAnimeList'
import { mangaUrl } from './config'
import { translate } from '@vitalets/google-translate-api'

interface Scan {
  scan_id: string
  chapter: number | null
  title: string
  images?: string[]
}

type MangaInsert = {
  title: string
  description: string
  thumbnails: string
  color: string | null
  "created_at": string
  site: string
  linkManga: string
  mean: number
  updated_at: string
  media_type: string
  status: string
  genres: Array<{
    id: number
    name: string
  }>
  authors: Array<{
    node: {
      id: number
      first_name: string
      last_name: string
    }
    role: string
  }>
}

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



  try {
    const { data, error } = await supabase.from('Scans').insert(scanFormatted).select()

    console.log('Data inserted successfully:', data, error)
  } catch (error) {
    console.error('Error posting scan to Supabase:', error)
  }
}

export const addNewMangaToSupabase = async (manga: MALMangaSearchResponse, title: string) => {



  const insertManga: MangaInsert = {
    title: title,
    description: manga.synopsis,
    thumbnails: manga.main_picture.large,
    color: null,
    "created_at": manga['start-date'],
    site: 'animeSama',
    linkManga: mangaUrl,
    mean: manga.mean,
    updated_at: manga.updated_at,
    media_type: manga.media_type,
    status: manga.status,
    genres: manga.genres,
    authors: manga.authors,
  }
  insertManga.description = insertManga.description.split('[Written by MAL Rewrite]')[0]



  try {
    const translationResult = await translate(insertManga.description, { from: 'en', to: 'fr' })
    insertManga.description = translationResult.text
    try {
      const { data, error } = await supabase.from('Mangas').insert(insertManga).select()
      console.log('Manga added successfully:', data, error)
    } catch (error) {
      console.error('Error adding new manga to Supabase:', error)
    }
  } catch (error) {
    console.error('Erreur lors de la traduction, utilisation de la description originale:', error)
    // En cas d'erreur, on garde la description en anglais
  }
}
