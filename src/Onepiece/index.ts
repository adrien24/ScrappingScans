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

  for (let i = 1; i <= 5; i++) {
    const images = await scrapeImagesChapter(i)
    const informations = await titleOfChapter(i)
    ListOfChapters.push({
      id: i,
      title: informations.title,
      description: informations.description,
      images,
    })
    if (i % 1 === 0 || i === totalChapters) {
      await writeFile('chapters1.json', JSON.stringify(ListOfChapters, null, 2), 'utf-8')
      console.log(`Saved up to chapter ${i}`)
    }
  }

  // Écriture dans un fichier JSON avec indentation
  console.log(ListOfChapters)
}

goToChapter()
