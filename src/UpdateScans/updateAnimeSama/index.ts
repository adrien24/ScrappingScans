import { Scan } from '../../AddNewScans/AnimeSama'
import { getAllChapters } from '../../AddNewScans/AnimeSama/getAllChapters'
import { getAllMangasInSupabase } from '../../AddNewScans/AnimeSama/getMangasInSupabase'
import { getScanImages } from '../../AddNewScans/AnimeSama/getScanImages'
import { postScansToSupabase } from '../../AddNewScans/AnimeSama/uploadToSupabase'
import { connectUser } from '../../supabaseClient'

const scansImages: string[] = []

type lastChapters = {
  mangaId: string
  linkManga: string
  lastChapter: number
}
let lastChapters: lastChapters[] = []

const updateAnimeSama = async () => {
  await connectUser()
  const mangas = await getAllMangasInSupabase('animeSama')
  try {
    for (const manga of mangas) {
      console.log(manga.title)

      const chapters: Scan[] = await getAllChapters(manga.linkManga)

      if (chapters.length === manga.Scans.length) {
        console.log(`No new chapters for ${manga.title}`)
      } else {
        // trouver les chapitres manquants
        const existingChapters = manga.Scans.map((scan) => scan.chapter)
        const newChapters = chapters.filter(
          (chapter) => !existingChapters.includes(chapter.chapter),
        )

        if (newChapters.length > 0) {
          for (const newChapter of newChapters) {
            console.log(`New chapter found: ${newChapter.chapter} - ${newChapter.title}`)
            const scanImages = await getScanImages(newChapter.title, manga.linkManga)
            newChapter.images = scanImages
            await postScansToSupabase(newChapter, manga.title)
          }
        } else {
          console.log(`No new chapters found for ${manga.title}`)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching mangas:', error)
    return
  }
}

const scrapScans = async (chapterId: string, url: string) => {
  const scanImages = await getScanImages(chapterId, url)
}

updateAnimeSama()
