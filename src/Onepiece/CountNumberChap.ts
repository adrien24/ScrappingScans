import puppeteer from 'puppeteer'

export async function countNumberOfChapters() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  )
  await page.goto('https://onepiecescan.fr/', {
    waitUntil: 'networkidle2',
  })

  console.log(page)

  await page.waitForSelector('#All_chapters ul li')

  const firstChapter = await page.$eval('#All_chapters ul li ul li', (el) => el.textContent?.trim())

  const input = firstChapter || ''
  const onlyNumbers = input.replace(/\D/g, '')

  const toNumber = parseInt(onlyNumbers, 10)

  await browser.close()

  return toNumber
}
