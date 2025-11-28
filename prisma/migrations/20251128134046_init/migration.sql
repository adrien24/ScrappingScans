-- CreateTable
CREATE TABLE "Mangas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnails" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "site" TEXT NOT NULL,
    "link_manga" TEXT NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "media_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "genres" JSONB NOT NULL DEFAULT '[]',
    "authors" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Mangas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scans" (
    "id" SERIAL NOT NULL,
    "scan_id" TEXT NOT NULL,
    "chapter" DOUBLE PRECISION,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" JSONB NOT NULL DEFAULT '[]',
    "date" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mangas_title_key" ON "Mangas"("title");

-- CreateIndex
CREATE INDEX "Scans_scan_id_idx" ON "Scans"("scan_id");

-- CreateIndex
CREATE INDEX "Scans_chapter_idx" ON "Scans"("chapter");

-- AddForeignKey
ALTER TABLE "Scans" ADD CONSTRAINT "Scans_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "Mangas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
