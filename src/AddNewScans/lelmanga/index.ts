import { connectUser } from '../../supabaseClient'
import { getAllChapters } from './getAllChapters'
import { getSelectedMangasInSupabase } from './getMangasInSupabase'
import { getScanImages } from './getScanImages'
import { postScansToSupabase } from './uploadToSupabase'

export interface Scan {
  scan_id: string
  chapter: string | null
  title: string
  url: string
  images?: string[]
  date: string
}

const scrapScans = async () => {
  const chapters: Scan[] = await getAllChapters()
  await connectUser()
  const mangaId = await getSelectedMangasInSupabase(chapters[0].scan_id)
  console.log(`Manga ID: ${mangaId}`)

  const scansImages: string[] = []

  // sort chapters by chapter number
  chapters.sort((a, b) => {
    const chapterA = a.chapter ? parseInt(a.chapter.replace(/\D/g, '')) : 0
    const chapterB = b.chapter ? parseInt(b.chapter.replace(/\D/g, '')) : 0
    return chapterA - chapterB
  })

  for (const chapter of chapters) {
    console.log(`Processing chapter: ${chapter.chapter} - ${chapter.title}`)

    try {
      const getScanImagesResult = await getScanImages(chapter.url)
      // sort images by title
      getScanImagesResult.sort((a, b) => a.localeCompare(b))
      console.log(getScanImagesResult)

      scansImages.push(...getScanImagesResult)
      chapter.images = getScanImagesResult
      await postScansToSupabase(chapter, mangaId)
    } catch (error) {
      console.error(`Erreur pour le chapitre ${chapter.url}:`, error)
    }
  }
}

scrapScans()
