import { countNumberOfChapters } from './CountNumberChap'
import { scrapeImagesChapter } from './scrapChapter'
import { titleOfChapter } from './titleOfChapter'
import { writeFile } from 'fs/promises'

const goToChapter = async () => {
  const totalChapters = await countNumberOfChapters()

  const ListOfChapters: Array<{
    id: number
    title: string
    description: string
    images: Array<string | null>
  }> = []

  for (let i = 1; i <= totalChapters; i++) {
    const images = await scrapeImagesChapter(i)
    const informations = await titleOfChapter(i)
    ListOfChapters.push({
      id: i,
      title: informations.title,
      description: informations.description,
      images,
    })

    console.log('Chapters scraped : ' + i);
    

    if (i % 5 === 0) {
      await writeFile('chapters.json', JSON.stringify(ListOfChapters, null, 2), 'utf-8')
      console.log(`Saved up to chapter ${i}`)
    }
  }

  // Écriture dans un fichier JSON avec indentation
  console.log(ListOfChapters)
}

goToChapter()
