import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { ScrapedChapter } from "../../../shared/types";
import { Logger } from "../../../shared/utils";
import { config, puppeteerConfig, configurePage } from "../../../shared/config";
import { REGEX_PATTERNS, TIMEOUTS } from "../../../shared/constants";

// Utiliser le plugin stealth pour éviter la détection Cloudflare
puppeteer.use(StealthPlugin());

const logger = new Logger("AnimeSamaScraper");

/**
 * Scraper pour AnimeSama
 */
export class AnimeSamaScraper {
  private static instance: AnimeSamaScraper;
  private activeBrowsers: Set<Browser> = new Set();

  private constructor() {}

  public static getInstance(): AnimeSamaScraper {
    if (!AnimeSamaScraper.instance) {
      AnimeSamaScraper.instance = new AnimeSamaScraper();
    }
    return AnimeSamaScraper.instance;
  }

  /**
   * Scraper tous les chapitres d'un manga
   */
  async scrapeChapters(url: string): Promise<ScrapedChapter[]> {
    logger.info(`Scraping chapters from: ${url}`);

    const browser = await puppeteer.launch(puppeteerConfig);
    this.activeBrowsers.add(browser);
    const page = await browser.newPage();

    try {
      await configurePage(page, config.scraping.userAgent);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Attendre que Cloudflare valide la requête
      logger.info("Waiting for Cloudflare validation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await page.waitForSelector("#titreOeuvre", { timeout: 30000 });

      const title = await page.$eval("#titreOeuvre", (h1) =>
        h1.textContent?.trim(),
      );

      const rawChapters = await page.$$eval(
        "#selectChapitres option",
        (options) => {
          const results = [];
          let lastChapter = null;
          let subChapterCount = 0;

          for (const opt of options) {
            const text = (opt.textContent || "").trim();
            const lines = text
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);

            const firstLine = lines[0] || "";

            // Regex pour détecter les numéros de chapitres (supporte "chapitre", "volume", "tome", "ch", "vol", etc.)
            const mStrict = firstLine.match(
              /(?:^|\b)(?:chapitre|volume|tome|ch|vol|t)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
            );
            const mLoose = mStrict
              ? null
              : firstLine.match(/^\s*(\d+(?:\.\d+)?)\s*$/);

            const chapterStr = (mStrict?.[1] ?? mLoose?.[1]) ?? null;
            let chapter = null;

            if (chapterStr) {
              chapter = Number(chapterStr);
              lastChapter = chapter;
              subChapterCount = 0;
            } else if (lastChapter !== null) {
              subChapterCount += 1;
              chapter = Number(`${lastChapter}.${subChapterCount}`);
            }

            results.push({
              title: firstLine,
              chapter,
            });
          }

          return results;
        },
      );

      const chapters: ScrapedChapter[] = rawChapters.map((chap) => ({
        scanId: title!,
        chapter: chap.chapter,
        title: chap.title,
      }));

      logger.success(`Found ${chapters.length} chapters`);
      return chapters;
    } catch (error) {
      logger.error("Error scraping chapters", error);
      throw error;
    } finally {
      this.activeBrowsers.delete(browser);
      await browser.close();
    }
  }

  /**
   * Scraper les images d'un chapitre spécifique
   */
  async scrapeChapterImages(
    chapterTitle: string,
    url: string,
  ): Promise<string[]> {
    logger.info(`Scraping images for chapter: ${chapterTitle}`);

    const browser = await puppeteer.launch(puppeteerConfig);
    this.activeBrowsers.add(browser);
    const page = await browser.newPage();

    try {
      await configurePage(page, config.scraping.userAgent);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Attendre que Cloudflare valide la requête
      logger.info("Waiting for Cloudflare validation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await page.waitForSelector("#selectChapitres", { timeout: 30000 });

      const options = await page.$$eval("#selectChapitres option", (opts) =>
        opts.map((option) => option.textContent?.trim()),
      );

      if (!options || options.length === 0) {
        throw new Error("No options found in the select element");
      }

      const chapterSelected = options.find((option) =>
        option?.includes(chapterTitle),
      );

      if (!chapterSelected) {
        throw new Error(`Chapter "${chapterTitle}" not found in selector`);
      }

      await page.select("select#selectChapitres", chapterSelected);
      await page.waitForSelector("img");

      const imageUrls = await page.$$eval("#scansPlacement img", (imgs) =>
        imgs
          .map((img) => `${img.getAttribute("src")}`)
          .filter((src) => src && !src.includes("readerarea.svg")),
      );

      logger.success(`Found ${imageUrls.length} images`);
      return imageUrls.filter((src): src is string => src !== null);
    } catch (error) {
      logger.error(`Error scraping chapter images: ${chapterTitle}`, error);
      throw error;
    } finally {
      this.activeBrowsers.delete(browser);
      await browser.close();
    }
  }

  async scrapAllMangasTitles(): Promise<Array<Record<string,string>>> {
    logger.info("Scraping all manga titles from AnimeSama");
    const url = `${config.sites.animeSama.baseUrl}/catalogue/?type%5B%5D=Scans&langue%5B%5D=VF&page=`;

    const browser = await puppeteer.launch(puppeteerConfig);
    this.activeBrowsers.add(browser);
    const page = await browser.newPage();

    try {
      await configurePage(page, config.scraping.userAgent);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      logger.info("Waiting for Cloudflare validation...");

       await page.waitForSelector("#sousBlocMiddle", { timeout: 30000 });

       console.log('page loaded');
       

       const rawMangas = await page.$$eval(
        "#list_catalog .catalog-card",
        (options) => {
          console.log(options);
          return options.map((option) => {
            const title = option.querySelector(".card-title")?.textContent?.trim() || "Unknown Title";
            const url = option.querySelector("a")?.getAttribute("href") || "";
            // si le dernier charactère n'est pas un slash, on l'ajoute pour éviter les problèmes de concaténation
            const formattedUrl = url.endsWith("/") ? url : `${url}/`;
            return { title: title, url: `${formattedUrl}scan/vf` };
          });
        });
        console.log(rawMangas);
        
       return rawMangas;

    } catch (error) {
      logger.error("Error scraping chapters", error);
      throw error;
    } finally {
      this.activeBrowsers.delete(browser);
      await browser.close();
    }
  }

  /**
   * Ferme tous les browsers actifs (appelé lors du shutdown)
   */
  async closeAllBrowsers(): Promise<void> {
    const browsers = Array.from(this.activeBrowsers);
    if (browsers.length > 0) {
      logger.info(`Closing ${browsers.length} active browser(s)...`);
      await Promise.allSettled(browsers.map((b) => b.close()));
      this.activeBrowsers.clear();
    }
  }
}

export const animeSamaScraper = AnimeSamaScraper.getInstance();
