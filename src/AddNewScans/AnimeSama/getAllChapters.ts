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

  await page.waitForSelector('#titreOeuvre')

  const title = await page.$eval('#titreOeuvre', (h1) => h1.textContent?.trim())

  const rawChapters = await page.$$eval('#selectChapitres option', (options) => {
    const results = []
    let lastChapter = null // dernier chapitre numéroté (entier ou décimal)
    let subChapterCount = 0 // compteur pour les sous-chapitres (décimales)

    for (const opt of options) {
      const text = (opt.textContent || '').trim()
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      const firstLine = lines[0] || ''

      // 1) Motif strict : "Chapitre 101", "Chapitre - 101.5", etc.
      const mStrict = firstLine.match(/(?:^|\b)chapitre\s*[:\-]?\s*(\d+(?:\.\d+)?)/i)

      // 2) Fallback : si le label est juste un nombre (évite "Chapitre spécial 2024")
      const mLoose = mStrict ? null : firstLine.match(/^\s*(\d+(?:\.\d+)?)\s*$/)

      const chapterStr = (mStrict?.[1] ?? mLoose?.[1]) || null
      let chapter = null

      if (chapterStr) {
        // Chapitre numéroté => reset du compteur de sous-chapitres
        chapter = Number(chapterStr)
        lastChapter = chapter
        subChapterCount = 0
      } else if (lastChapter !== null) {
        // Titre sans numéro => ajoute une décimale : 100.1, 100.2, etc.
        subChapterCount += 1
        chapter = Number(`${lastChapter}.${subChapterCount}`)
      } else {
        // Aucun numéro connu => reste null
        chapter = null
      }

      results.push({
        title: firstLine,
        chapter, // ex: 100, 100.1, 100.2, 101, 101.1
      })
    }

    return results
  })

  await browser.close()

  // // Injecte le titre dans chaque objet
  const chapters = rawChapters.map((chap) => ({
    ...chap,
    scan_id: title!,
  }))

  return chapters
}
