import puppeteer from 'puppeteer'

export async function getAllChapters(url: string) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  await page.waitForSelector('#titreOeuvre')

  const title = await page.$eval('#titreOeuvre', (h1) => h1.textContent?.trim())

  // // On récupère les données brutes du DOM
  const rawChapters = await page.$$eval('#selectChapitres option', (liens) =>
    liens.map((a, index) => {
      const lines = a.textContent
        ?.split('\n')
        .map((line) => line.trim())
        .filter((line) => line)

      const chapterLine = lines?.[0] || ''
      const dateLine = lines?.[1] || ''

      const chapterMatch = chapterLine.match(/(\d+(\.\d+)?)/)
      const chapter = chapterMatch ? chapterMatch[0] : null

      return {
        title: `Chapitre ${chapter}`,
        chapter: index + 1,
      }
    }),
  )

  await browser.close()

  // // Injecte le titre dans chaque objet
  const chapters = rawChapters.map((chap) => ({
    ...chap,
    scan_id: title!,
  }))

  return chapters
}
