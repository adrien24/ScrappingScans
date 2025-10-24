import puppeteer from 'puppeteer'
import { supabase } from '../../supabaseClient'

const uploadChapterToSupabase = async (chapters: any) => {
  console.log('ChaptersUpload:', chapters)

  try {
    const { data: ChaptersUpload, error } = await supabase.from('Scans').insert(chapters).select()

    if (error) {
      console.error('Error inserting data:', error)
    } else {
      console.log('Data inserted successfully:')
      console.log('id:', ChaptersUpload[0].id)
      console.log('image length:', ChaptersUpload[0].images.length)
      console.log('first link image:', ChaptersUpload[0].images[0])
      console.log('title:', ChaptersUpload[0].title)
      console.log('Scrapping finished')
      console.log('-----------------------------------')
    }
  } catch (error) {
    console.error('Error in fetchData:', error)
  }
}

export const getChapters = async (chaptersNumber: number[]) => {
  await Promise.all(
    chaptersNumber.map(async (chapter) => {
      const browser = await puppeteer.launch({
        headless: true,
     
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      const page = await browser.newPage()

      await page.goto(`https://onepiecescan.fr/manga/one-piece-scan-chapitre-${chapter}-vf/`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      })

      await page.waitForSelector('img')

      const _imageLinks = await page.$$eval('img', (imgs) =>
        imgs.map((img) => img.getAttribute('data-src') || img.getAttribute('src')),
      )

      await browser.close()
      await createJSON(_imageLinks, chapter)
    }),
  )
}

const createJSON = async (imageLinks: (string | null)[], chapter: number) => {
  const jsonChapter: Array<{
    scan_id: string
    chapter: string
    title: string
    description: string
    images: (string | null)[]
    date: string
  }> = []

  const url = `https://api.api-onepiece.com/v2/chapters/fr/${chapter}`

  const res = await fetch(url)

  if (res.status === 404) {
    jsonChapter.push({
      scan_id: 'One Piece',
      chapter: chapter.toString(),
      title: 'Nom à venir',
      description: 'Description à venir',
      images: imageLinks,
      date: 'À venir',
    })
    await uploadChapterToSupabase(jsonChapter)
    return
  }
  if (!res.ok) {
    console.error(`Erreur avec l'API : ${res.status} ${res.statusText}`)
    return
  }

  const json = await res.json()
  jsonChapter.push({
    scan_id: 'One Piece',
    chapter: json.id,
    title: json.title,
    description: json.description,
    images: imageLinks,
    date: '',
  })

  await uploadChapterToSupabase(jsonChapter)
}
