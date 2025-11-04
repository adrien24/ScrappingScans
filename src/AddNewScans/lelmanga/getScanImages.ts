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

export async function getScanImages(url: string): Promise<Array<string>> {
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

  // Scroll pour forcer le chargement des images lazy-loaded
  await autoScroll(page)

  // Attendre les images dans #readerarea
  await page.waitForSelector('#readerarea img')

  // Récupérer les vraies images (sans les SVG)
  const imageUrls = await page.$$eval('#readerarea img', (imgs) =>
    imgs
      .map((img) => img.getAttribute('src'))
      .filter(
        (src) => src && src.includes('/wp-content/uploads/') && !src.includes('readerarea.svg'),
      ),
  )

  await browser.close()

  return imageUrls.filter((src): src is string => src !== null)
}
