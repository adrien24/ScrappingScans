import { connectUser } from '../../supabaseClient'
import { getAllChapters } from './getAllChapters'
import { getMangasInSupabase } from './getMangasInSupabase'
import { getScanImages } from './getScanImages'

let scansImages: Array<string> = []

const scrapScans = async () => {
  const { chapters, title } = await getAllChapters()
  await connectUser()
  if (!title) {
    throw new Error('Chapters or title not found')
  }
  await getMangasInSupabase(title)
  // const scansImages: string[] = []

  // for (const chapter of chapters) {
  //   try {
  //     const getScanImagesResult = await getScanImages(chapter.url)
  //     scansImages.push(...getScanImagesResult)
  //     console.log('Scans images:', scansImages)
  //   } catch (error) {
  //     console.error(`Erreur pour le chapitre ${chapter.url}:`, error)
  //   }
  // }
}

scrapScans()
