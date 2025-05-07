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
      console.log('Data inserted successfully:', ChaptersUpload)
    }
  } catch (error) {
    console.error('Error in fetchData:', error)
  }
}

export const getChapters = async (chaptersNumber: number[]) => {
  let imageLinks: (string | null)[] = []
  await Promise.all(
    chaptersNumber.map(async (chapter) => {
      const browser = await puppeteer.launch({
        headless: true,
      })
      const page = await browser.newPage()
    
      await page.goto('https://onepiecescan.fr/manga/one-piece-scan-chapitre-${chapter}-vf/', {
        waitUntil: 'networkidle2',
      })

      await page.waitForSelector('img')

  imageLinks = await page.$$eval('img', (imgs) =>
    imgs.map((img) => img.getAttribute('data-src') || img.getAttribute('src'))
  )
  await browser.close()

    }))
  await createJSON(imageLinks, chaptersNumber)
}

const createJSON = async (imageLinks: (string | null)[], chapter: number[]) => {
  console.log(chapter)

  const jsonChapter: Array<{
    id: string
    title: string
    description: string
    images: (string | null)[]
  }> = []
  await Promise.all(
    chapter.map(async (chapter) => {
      const url = `https://api.api-onepiece.com/v2/chapters/fr/${chapter}`

      const res = await fetch(url)
      if (res.status === 404) {
        jsonChapter.push({
          id: chapter.toString(),
          title: 'Nom à venir',
          description: 'Description à venir',
          images: imageLinks,
        })
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
    })
  )
  await uploadChapterToSupabase(jsonChapter)
}
