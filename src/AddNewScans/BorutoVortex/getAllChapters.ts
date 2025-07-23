import puppeteer from 'puppeteer'

export async function getAllChapters() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`https://www.lelmanga.com/manga/boruto-two-blue-vortex`, {
    waitUntil: 'networkidle2',
  })

  await page.waitForSelector('.eplister')
  await page.waitForSelector('#titlemove')

  let title = await page.$eval('#titlemove h1', (h1) => h1.textContent?.trim())

  const chapters = await page.$$eval('.eplister ul li a', (liens) =>
    liens.map((a) => ({
      titre: a.textContent?.trim(),
      url: a.href,
    })),
  )

  await browser.close()

  return { chapters, title }
}
