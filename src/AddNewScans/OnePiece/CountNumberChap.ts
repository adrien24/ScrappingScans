import puppeteer from "puppeteer";

export async function countNumberOfChapters() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "/home/hangover/.cache/puppeteer/chrome/linux-135.0.7049.114/chrome-linux64/chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://onepiecescan.fr/", {
    waitUntil: "networkidle2",
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
}
