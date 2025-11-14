import puppeteer from 'puppeteer'

export async function getAllChapters(url: string) {
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

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  )
  await page.setViewport({ width: 1920, height: 1080 })

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    })
  })

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  })

  await page.waitForSelector('#titreOeuvre')

  const title = await page.$eval('#titreOeuvre', (h1) => h1.textContent?.trim())

  const rawChapters = await page.$$eval('#selectChapitres option', (options) => {
    const results = []
    let lastChapter = null
    let subChapterCount = 0

    for (const opt of options) {
      const text = (opt.textContent || '').trim()
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      const firstLine = lines[0] || ''

      const mStrict = firstLine.match(/(?:^|\b)chapitre\s*[:\-]?\s*(\d+(?:\.\d+)?)/i)

      const mLoose = mStrict ? null : firstLine.match(/^\s*(\d+(?:\.\d+)?)\s*$/)

      const chapterStr = (mStrict?.[1] ?? mLoose?.[1]) || null
      let chapter = null

      if (chapterStr) {
        chapter = Number(chapterStr)
        lastChapter = chapter
        subChapterCount = 0
      } else if (lastChapter !== null) {
        subChapterCount += 1
        chapter = Number(`${lastChapter}.${subChapterCount}`)
      } else {
        chapter = null
      }

      results.push({
        title: firstLine,
        chapter,
      })
    }

    return results
  })

  await browser.close()

  const chapters = rawChapters.map((chap) => ({
    ...chap,
    scan_id: title!,
  }))

  return chapters
}
