import { prisma } from "../../../core/database/prisma.client";
import { IScanRepository } from "../domain/manga.repository.interface";
import { Scan, Chapter } from "../../../shared/types";
import { Logger } from "../../../shared/utils";
import { Prisma } from "@prisma/client";

const logger = new Logger("ScanRepositoryPrisma");

/**
 * Implémentation du repository pour les scans avec Prisma
 */
export class ScanRepositoryPrisma implements IScanRepository {
  private static instance: ScanRepositoryPrisma;

  private constructor() {}

  public static getInstance(): ScanRepositoryPrisma {
    if (!ScanRepositoryPrisma.instance) {
      ScanRepositoryPrisma.instance = new ScanRepositoryPrisma();
    }
    return ScanRepositoryPrisma.instance;
  }

  async findByMangaId(mangaId: string): Promise<Scan[]> {
    try {
      const scans = await prisma.scan.findMany({
        where: { scanId: mangaId },
        orderBy: { chapter: "asc" },
      });

      return scans.map((scan: Prisma.ScanGetPayload<{}>) =>
        this.mapToScan(scan),
      );
    } catch (error) {
      logger.error(`Error finding scans for manga: ${mangaId}`, error);
      throw error;
    }
  }

  async findByMangaIdAndChapter(
    mangaId: string,
    chapterId: number,
  ): Promise<Scan[]> {
    try {
      const scans = await prisma.scan.findMany({
        where: { scanId: mangaId, chapter: chapterId },
        orderBy: { chapter: "asc" },
      });

      return scans.map((scan: Prisma.ScanGetPayload<{}>) =>
        this.mapToScan(scan),
      );
    } catch (error) {
      logger.error(`Error finding scans for manga: ${mangaId}`, error);
      throw error;
    }
  }

  async create(scan: Partial<Scan>): Promise<Scan> {
    try {
      const created = await prisma.scan.create({
        data: {
          scanId: scan.scanId!,
          chapter: scan.chapter || null,
          title: scan.title!,
          description: scan.description || "",
          images: (scan.images || []) as any,
          date: scan.date || "",
        },
      });

      logger.success(`Scan created: Chapter ${scan.chapter} - ${scan.title}`);
      return this.mapToScan(created);
    } catch (error) {
      logger.error(`Error creating scan: ${scan.title}`, error);
      throw error;
    }
  }

  async findByChapter(mangaId: string): Promise<Chapter[] | null> {
    try {
      const chapters = await prisma.scan.findMany({
        where: {
          scanId: mangaId,
        },
      });

      return chapters.map((chapter) => this.mapToChapter(chapter));
    } catch (error) {
      logger.error(`Error finding scan by chapter: ${mangaId}`, error);
      throw error;
    }
  }

  /**
   * Mapper les données Prisma vers l'entité Scan
   */
  private mapToScan(data: Prisma.ScanGetPayload<{}>): Scan {
    return {
      id: data.id,
      scanId: data.scanId,
      chapter: data.chapter,
      title: data.title,
      description: data.description,
      images: Array.isArray(data.images)
        ? data.images
        : JSON.parse(String(data.images || "[]")),
      date: data.date,
      createdAt: data.createdAt.toISOString(),
    };
  }

  /**
   * Mapper les données Prisma vers l'entité Chapter
   */
  private mapToChapter(data: Prisma.ScanGetPayload<{}>): Chapter {
    return {
      name: data.title,
      id: data.chapter,
      images: data.images,
    };
  }
}

export const scanRepositoryPrisma = ScanRepositoryPrisma.getInstance();
