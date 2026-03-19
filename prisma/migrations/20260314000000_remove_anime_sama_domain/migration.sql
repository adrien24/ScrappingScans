-- Update linkManga column to remove https://anime-sama.tv prefix
UPDATE "Mangas"
SET "link_manga" = SUBSTRING("link_manga" FROM LENGTH('https://anime-sama.tv') + 1)
WHERE "link_manga" LIKE 'https://anime-sama.tv%';
