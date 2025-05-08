import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();

const { URL_ONEPIECE } = process.env;
if (!URL_ONEPIECE) {
  throw new Error("URL_ONEPICE is not defined in the environment variables");
}

export const selectLastChapter = async (): Promise<number> => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        "/home/hangover/.cache/puppeteer/chrome/linux-135.0.7049.114/chrome-linux64/chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(URL_ONEPIECE, {
      waitUntil: "networkidle2",
    });

    const firstChapter = await page.$eval("#All_chapters ul li ul li", (el) =>
      el.textContent?.trim(),
    );

    const input = firstChapter || "";
    const onlyNumbers = input.replace(/\D/g, "");

    const toNumber = parseInt(onlyNumbers, 10);

    await browser.close();

    return toNumber;
  } catch (err) {
    console.log(err);
    return 0;
  }
};
