"use strict";
/**
 * Types communs utilisés dans toute l'application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaType = exports.MangaStatus = exports.SiteSource = void 0;
var SiteSource;
(function (SiteSource) {
    SiteSource["ANIME_SAMA"] = "animeSama";
    SiteSource["LELMANGA"] = "lelmanga";
    SiteSource["ONE_PIECE"] = "onePiece";
})(SiteSource || (exports.SiteSource = SiteSource = {}));
var MangaStatus;
(function (MangaStatus) {
    MangaStatus["ONGOING"] = "ongoing";
    MangaStatus["COMPLETED"] = "completed";
    MangaStatus["HIATUS"] = "hiatus";
    MangaStatus["CANCELLED"] = "cancelled";
})(MangaStatus || (exports.MangaStatus = MangaStatus = {}));
var MediaType;
(function (MediaType) {
    MediaType["MANGA"] = "manga";
    MediaType["MANHWA"] = "manhwa";
    MediaType["MANHUA"] = "manhua";
    MediaType["LIGHT_NOVEL"] = "light_novel";
})(MediaType || (exports.MediaType = MediaType = {}));
