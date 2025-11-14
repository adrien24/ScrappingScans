import { connectUser } from '../../supabaseClient'
import { getAllChapters } from './getAllChapters'
import { getSelectedMangasInSupabase } from './getMangasInSupabase'
import { getScanImages } from './getScanImages'
import { postScansToSupabase } from './uploadToSupabase'
import { mangaUrl, Scan } from './config'

const scrapScans = async () => {
  const chapters: Scan[] = await getAllChapters(mangaUrl)
  const mangaId = chapters[0].scan_id
  console.log('oui');


  await connectUser()
  await getSelectedMangasInSupabase(mangaId)

  const scansImages: string[] = []

  chapters.sort((a, b) => {
    const chapterA = a.chapter ? a.chapter : 0
    const chapterB = b.chapter ? b.chapter : 0
    return chapterA - chapterB
  })

  for (const chapter of chapters) {
    try {
      const getScanImagesResult: any = await getScanImages(chapter.title, mangaUrl)
      scansImages.push(...getScanImagesResult)
      chapter.images = getScanImagesResult
      await postScansToSupabase(chapter, mangaId)
    } catch (error) {
      console.error(`Error fetching images for chapter ${chapter.scan_id}:`, error)
      continue // Skip to the next chapter if there's an error
    }
  }
}

scrapScans()
