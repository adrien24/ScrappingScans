import { Scan } from '../../AddNewScans/lelmanga'
import { getAllChapters } from '../../AddNewScans/lelmanga/getAllChapters'
import { getAllMangasInSupabase } from '../../AddNewScans/lelmanga/getMangasInSupabase'
import { getScanImages } from '../../AddNewScans/lelmanga/getScanImages'
import { postScansToSupabase } from '../../AddNewScans/lelmanga/uploadToSupabase'
import { connectUser } from '../../supabaseClient'

const scansImages: string[] = []

type lastChapters = {
  mangaId: string
  linkManga: string
  lastChapter: number
}
let lastChapters: lastChapters[] = []

const updateLelmanga = async () => {
  await connectUser()
  const mangas = await getAllMangasInSupabase()

  lastChapters = mangas.map((manga) => {
    const lastChapter = manga.Scans.reduce((max, scan) => {
      return scan.chapter > max ? scan.chapter : max
    }, 0)

    return {
      mangaId: manga.title,
      linkManga: manga.linkManga,
      lastChapter,
    }
  })

  for (const chapter of lastChapters) {
    console.log(`Processing manga: ${chapter.mangaId} - Last chapter: ${chapter.lastChapter}`)

    try {
      const chapters: Scan[] = await getAllChapters(chapter.linkManga)
      const newChapters = chapters.filter((chap) => {
        const chapterNumber = parseInt(chap.chapter || '0')
        return chapterNumber > chapter.lastChapter
      })

      if (newChapters.length > 0) {
        for (const newChapter of newChapters) {
          console.log(`New chapter found: ${newChapter.chapter} - ${newChapter.title}`)
          const scanImages = await getScanImages(newChapter.url)
          newChapter.images = scanImages
          await postScansToSupabase(newChapter, chapter.mangaId)
        }
      } else {
        console.log('No new chapters found.')
      }
    } catch (error) {
      console.error(`Error processing manga ${chapter.linkManga}:`, error)
    }
  }
}

updateLelmanga()
