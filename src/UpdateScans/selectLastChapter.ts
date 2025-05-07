import puppeteer from 'puppeteer'

export const selectLastChapter = async (): Promise<number> => {
  const browser = await puppeteer.launch({
    headless: true,
  })
  const page = await browser.newPage()

  await page.goto('https://onepiecescan.fr/', {
    waitUntil: 'networkidle2',
  })
  const firstChapter = await page.$eval('#All_chapters ul li ul li', (el) => el.textContent?.trim())

  const input = firstChapter || ''
  const onlyNumbers = input.replace(/\D/g, '')

  const toNumber = parseInt(onlyNumbers, 10)

  await browser.close()

  return toNumber
}
