import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
dotenv.config()

// const { URL_ONEPIECE } = https://onepiecescan.fr/;
// if (!URL_ONEPIECE) {
//   throw new Error("URL_ONEPICE is not defined in the environment variables");
// }

export const selectLastChapter = async (): Promise<number> => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    await page.goto('https://onepiecescan.fr/', {
      waitUntil: 'networkidle2',
    })

    const firstChapter = await page.$eval('#All_chapters ul li ul li', (el) =>
      el.textContent?.trim(),
    )

    const input = firstChapter || ''
    const onlyNumbers = input.replace(/\D/g, '')

    const toNumber = parseInt(onlyNumbers, 10)

    await browser.close()

    return toNumber
  } catch (err) {
    console.log(err)
    return 0
  }
}
