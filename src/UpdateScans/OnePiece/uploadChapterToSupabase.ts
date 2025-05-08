import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabaseUrl = 'https://ajtyenefvkagyajggfrv.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdHllbmVmdmthZ3lhamdnZnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTgyNTgsImV4cCI6MjA2MTU5NDI1OH0.-nD9MrWPJ5PWiUZRIQs-vTqklTWGkKIbHeZcuLvlcFc'

const supabase = createClient(supabaseUrl, supabaseKey)

const uploadChapterToSupabase = async (chapters: any) => {
  try {
    const { data: ChaptersUpload, error } = await supabase
      .from('OnePiece')
      .insert(chapters)
      .select()

    if (error) {
      console.error('Error inserting data:', error)
    } else {
      console.log('Data inserted successfully:')
      console.log('id:', ChaptersUpload[0].id)
      console.log('image length:', ChaptersUpload[0].images.length)
      console.log('first link image:', ChaptersUpload[0].images[0])
      console.log('title:', ChaptersUpload[0].title)
      console.log('scrapping time:', new Date().toLocaleTimeString())
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
        executablePath:
          '/home/hangover/.cache/puppeteer/chrome/linux-135.0.7049.114/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      const page = await browser.newPage()

      await page.goto(`https://onepiecescan.fr/manga/one-piece-scan-chapitre-${chapter}-vf/`, {
        waitUntil: 'networkidle2',
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
    id: string
    title: string
    description: string
    images: (string | null)[]
  }> = []

  const url = `https://api.api-onepiece.com/v2/chapters/fr/${chapter}`

  const res = await fetch(url)

  if (res.status === 404) {
    jsonChapter.push({
      id: chapter.toString(),
      title: 'Nom à venir',
      description: 'Description à venir',
      images: imageLinks,
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
    id: json.id,
    title: json.title,
    description: json.description,
    images: imageLinks,
  })

  await uploadChapterToSupabase(jsonChapter)
}
