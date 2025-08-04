import puppeteer from 'puppeteer'

export async function scrapeImagesChapter(numberOfChapter: number) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`https://onepiecescan.fr/manga/one-piece-scan-chapitre-${numberOfChapter}-vf/`, {
    waitUntil: 'networkidle2',
  })

  await page.waitForSelector('img')

  const imageUrls = await page.$$eval('img', (imgs) =>
    imgs.map((img) => img.getAttribute('data-src') || img.getAttribute('src')),
  )

  await browser.close()

  return imageUrls.filter(Boolean)
}
