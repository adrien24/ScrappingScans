import puppeteer from 'puppeteer'

export async function scrapeImagesChapter(numberOfChapter: number) {
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

  await page.goto(`https://onepiecescan.fr/manga/one-piece-scan-chapitre-${numberOfChapter}-vf/`, {
    waitUntil: 'networkidle2',
    timeout: 60000
  })

  await page.waitForSelector('img')

  const imageUrls = await page.$$eval('img', (imgs) =>
    imgs.map((img) => img.getAttribute('data-src') || img.getAttribute('src')),
  )

  await browser.close()

  return imageUrls.filter(Boolean)
}
