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
  const browser = await puppeteer.launch({ headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

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
