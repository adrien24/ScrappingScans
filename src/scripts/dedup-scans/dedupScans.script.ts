import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deduplicateScans() {
  console.log("Recherche de doublons de scans dans la base de données...\n");

  // Récupère tous les groupes (scanId, chapter) qui ont plus d'un enregistrement
  const duplicates: { scan_id: string; chapter: number | null; count: bigint }[] =
    await prisma.$queryRaw`
      SELECT scan_id, chapter, COUNT(*) as count
      FROM "Scans"
      GROUP BY scan_id, chapter
      HAVING COUNT(*) > 1
    `;

  if (duplicates.length === 0) {
    console.log("Aucun doublon trouvé. La base de données est propre.");
    return;
  }

  console.log(`${duplicates.length} groupe(s) de doublons détecté(s) :\n`);

  let totalDeleted = 0;

  for (const dup of duplicates) {
    const { scan_id, chapter, count } = dup;

    // Récupère tous les scans de ce groupe triés par id croissant
    const scans = await prisma.scan.findMany({
      where: { scanId: scan_id, chapter: chapter },
      orderBy: { id: "asc" },
      select: { id: true, title: true, createdAt: true },
    });

    // Conserve le premier (id le plus bas), supprime le reste
    const [toKeep, ...toDelete] = scans;
    const idsToDelete = toDelete.map((s) => s.id);

    console.log(
      `  Manga ${scan_id} | Chapitre ${chapter ?? "null"} | ${count} entrées → suppression de ${idsToDelete.length} doublon(s) (conservé : id=${toKeep.id})`
    );

    const deleted = await prisma.scan.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    totalDeleted += deleted.count;
  }

  console.log(`\nTerminé. ${totalDeleted} scan(s) en double supprimé(s).`);
}

deduplicateScans()
  .catch((e) => {
    console.error("Erreur lors de la déduplication :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
