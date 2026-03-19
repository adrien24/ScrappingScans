import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../../core/database";
import { Logger } from "../../shared/utils";
import * as fs from "fs";
import * as path from "path";
import puppeteer from "puppeteer";
import { puppeteerConfig, configurePage } from "../../shared/config/puppeteer.config";

const logger = new Logger("DomainTestController");

interface DomainExtension {
  metadata: {
    description: string;
    lastUpdate: string;
    totalCount: number;
  };
  allExtensions: string[];
}

/**
 * Controller pour tester les extensions de domaine
 */
export class DomainTestController {
  /**
   * POST /api/domain-test/find-working
   * Tester les extensions de domaine jusqu'à trouver un domaine qui fonctionne
   */
  async findWorkingDomain(req: Request, res: Response): Promise<void> {
    try {
      const { baseName = "anime-sama", timeout = 5000 } = req.body;

      logger.info(`Starting domain test for: ${baseName}`);

      // Charger les extensions depuis le fichier JSON
      const extensionsPath = path.join(process.cwd(), "domain-extensions.json");
      const extensionsData: DomainExtension = JSON.parse(
        fs.readFileSync(extensionsPath, "utf-8")
      );

      const extensions = extensionsData.allExtensions;
      logger.info(`Will test up to ${extensions.length} domain extensions`);

      // Répondre immédiatement pour éviter le timeout
      res.json({
        message: "Domain search started in background",
        totalExtensions: extensions.length,
        baseName,
        note: "Check the database (DomainTests table) for the result",
      });

      // Continuer la recherche en arrière-plan
      this.findFirstWorkingDomain(baseName, extensions, timeout).catch((error) => {
        logger.error("Error during background domain search", error);
      });
    } catch (error) {
      logger.error("Error starting domain test", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Trouver le premier domaine qui fonctionne et l'enregistrer en BDD
   */
  private async findFirstWorkingDomain(
    baseName: string,
    extensions: string[],
    timeout: number
  ): Promise<any | null> {
    let tested = 0;

    for (const extension of extensions) {
      tested++;
      const result = await this.testSingleDomain(baseName, extension, timeout);

      if (tested % 50 === 0) {
        logger.info(`Progress: ${tested}/${extensions.length} tested, no working domain yet...`);
      }

      if (result.isWorking) {
        logger.info(`✅ FOUND WORKING DOMAIN: ${result.domain}!`);
        logger.info(`Tested ${tested} domains before finding it`);
        return result;
      }
    }

    logger.warn(`No working domain found after testing ${tested} extensions`);
    return null;
  }

  /**
   * Tester un seul domaine avec Puppeteer (pour contourner Cloudflare)
   */
  private async testSingleDomain(
    baseName: string,
    extension: string,
    timeout: number
  ): Promise<{
    domain: string;
    extension: string;
    isWorking: boolean;
    statusCode?: number;
    responseTime?: number;
  }> {
    const domain = `${baseName}.${extension}`;
    const startTime = Date.now();
    let browser = null;

    try {
      // Lancer un navigateur Puppeteer
      browser = await puppeteer.launch(puppeteerConfig);
      const page = await browser.newPage();
      
      // Configurer la page avec anti-détection
      await configurePage(page, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      
      // Définir un timeout pour la navigation
      page.setDefaultNavigationTimeout(timeout);

      // Tester HTTPS d'abord
      let url = `https://${domain}`;
      let response;
      
      try {
        response = await page.goto(url, { 
          waitUntil: "domcontentloaded",
          timeout 
        });
      } catch (httpsError) {
        // Si HTTPS échoue, essayer HTTP
        logger.info(`HTTPS failed for ${domain}, trying HTTP...`);
        url = `http://${domain}`;
        try {
          response = await page.goto(url, { 
            waitUntil: "domcontentloaded",
            timeout 
          });
        } catch (httpError) {
          await browser.close();
          return { domain, extension, isWorking: false };
        }
      }

      const responseTime = Date.now() - startTime;
      const statusCode = response?.status() || 0;
      const statusOk = statusCode >= 200 && statusCode < 400;

      // Attendre un peu pour laisser Cloudflare se charger si nécessaire
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extraire le titre de la page
      const titleContent = await page.title();
      
      logger.info(`🔍 ${domain} - Status: ${statusCode}, Title: "${titleContent}"`);
      
      const expectedTitle = "Anime-Sama - Streaming et catalogage d'animes et scans.";
      const hasCorrectTitle = titleContent === expectedTitle;

      const isWorking = statusOk && hasCorrectTitle;

      await browser.close();

      if (isWorking) {
        // Stocker en BDD
        await prisma.domainTest.create({
          data: {
            domain,
            extension,
            isWorking: true,
            statusCode,
            responseTime,
          },
        });

        logger.info(
          `✅ ${domain} is the correct Anime-Sama site! (${statusCode}) - Saved to database`
        );

        return {
          domain,
          extension,
          isWorking: true,
          statusCode,
          responseTime,
        };
      }

      return { domain, extension, isWorking: false };
    } catch (error: any) {
      if (browser) {
        await browser.close();
      }
      logger.debug(`❌ ${domain} failed: ${error.message}`);
      return { domain, extension, isWorking: false };
    }
  }
  /**
   * GET /api/domain-test/check
   * Vérifier rapidement si un domaine fonctionnel a été trouvé
   */
  async checkResult(req: Request, res: Response): Promise<void> {
    try {
      const result = await prisma.domainTest.findFirst({
        where: { isWorking: true },
        orderBy: { createdAt: "desc" },
      });

      if (result) {
        res.json({
          found: true,
          domain: result.domain,
          extension: result.extension,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          foundAt: result.createdAt,
        });
      } else {
        res.json({
          found: false,
          message: "No working domain found yet",
        });
      }
    } catch (error) {
      logger.error("Error checking domain test result", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }}

export const domainTestController = new DomainTestController();
