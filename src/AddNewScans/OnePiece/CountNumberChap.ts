import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();

const { URL_ONEPIECE } = process.env;
if (!URL_ONEPIECE) {
  throw new Error("URL_ONEPICE is not defined in the environment variables");
}

export const countNumberOfChapters = async (): Promise<number> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  const page = await browser.newPage();

  // Simuler un vrai navigateur
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1920, height: 1080 });

  // Masquer les indicateurs de webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  await page.goto(URL_ONEPIECE, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  await page.waitForSelector("#All_chapters ul li");

  const firstChapter = await page.$eval("#All_chapters ul li ul li", (el) =>
    el.textContent?.trim(),
  );

  const input = firstChapter || "";
  const onlyNumbers = input.replace(/\D/g, "");

  const toNumber = parseInt(onlyNumbers, 10);

  await browser.close();

  return toNumber;
};
