import puppeteer from 'puppeteer'

async function autoScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve(undefined)
        }
      }, 100)
    })
  })
}

export async function getScanImages(chapterId: string, url: string): Promise<Array<string>> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  })

  // Attendre le selecteur de chapitres
  await page.waitForSelector('#selectChapitres') // adapte ce sélecteur si nécessaire
  const options = await page.$$eval('#selectChapitres option', (opts) =>
    opts.map((option) => option.textContent?.trim()),
  )

  if (!options) throw new Error('No options found in the select element')
  const chapterSelected = options.find((option) => option!.includes(chapterId))

  // Sélectionner l'option via son `value`
  if (!chapterSelected) throw new Error(`Chapitre "${chapterId}" introuvable dans le sélecteur.`)
  await page.select('select#selectChapitres', chapterSelected)

  // Attendre que les images se chargent
  await page.waitForSelector('img')

  // Récupérer les vraies images (sans les SVG)
  const imageUrls = await page.$$eval('#scansPlacement img', (imgs) =>
    imgs
      .map((img) => `https://anime-sama.org${img.getAttribute('src')}`)
      .filter((src) => src && !src.includes('readerarea.svg')),
  )

  await browser.close()

  return imageUrls.filter((src): src is string => src !== null)
}
