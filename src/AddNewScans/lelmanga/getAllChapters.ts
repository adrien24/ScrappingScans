import puppeteer from 'puppeteer'

export async function getAllChapters(url: string = 'https://www.lelmanga.com/manga/kagura-bachi') {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  })
  const page = await browser.newPage()

  // Simuler un vrai navigateur
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  )
  await page.setViewport({ width: 1920, height: 1080 })

  // Masquer les indicateurs de webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    })
  })

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  })

  await page.waitForSelector('.eplister')
  await page.waitForSelector('#titlemove')

  const title = await page.$eval('#titlemove h1', (h1) => h1.textContent?.trim())

  // On récupère les données brutes du DOM
  const rawChapters = await page.$$eval('.eplister ul li a', (liens) =>
    liens.map((a) => {
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
        chapter,
        date: dateLine,
        url: a.href,
      }
    }),
  )

  await browser.close()

  // Injecte le titre dans chaque objet
  const chapters = rawChapters.map((chap) => ({
    ...chap,
    scan_id: title!,
  }))

  return chapters
}
