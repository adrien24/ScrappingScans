import { connectUser } from '../../supabaseClient'
import { getAllChapters } from './getAllChapters'
import { getSelectedMangasInSupabase } from './getMangasInSupabase'
import { getScanImages } from './getScanImages'
import { postScansToSupabase } from './uploadToSupabase'

export interface Scan {
  scan_id: string
  chapter: number | null
  title: string
  images?: string[]
}

const scrapScans = async () => {
  const url: string = 'https://anime-sama.fr/catalogue/berserk/scan/vf/'
  const chapters: Scan[] = await getAllChapters(url)

  await connectUser()
  const mangaId = await getSelectedMangasInSupabase(chapters[0].scan_id)
  console.log(mangaId)

  // const scansImages: string[] = []

  // // sort chapters by chapter number
  // chapters.sort((a, b) => {
  //   const chapterA = a.chapter ? a.chapter : 0
  //   const chapterB = b.chapter ? b.chapter : 0
  //   return chapterA - chapterB
  // })

  // for (const chapter of chapters) {
  //   try {
  //     const getScanImagesResult: any = await getScanImages(chapter.title, url)
  //     scansImages.push(...getScanImagesResult)
  //     chapter.images = getScanImagesResult
  //     await postScansToSupabase(chapter, mangaId)
  //   } catch (error) {
  //     console.error(`Error fetching images for chapter ${chapter.scan_id}:`, error)
  //     continue // Skip to the next chapter if there's an error
  //   }
  // }
}

scrapScans()
