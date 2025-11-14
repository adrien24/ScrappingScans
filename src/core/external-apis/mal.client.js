"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.malClient = void 0;
var axios_1 = require("axios");
var crypto = require("crypto");
var http = require("http");
var fs = require("fs");
var open = require("open");
var path = require("path");
var utils_1 = require("../../shared/utils");
var config_1 = require("../../shared/config");
var logger = new utils_1.Logger('MALClient');
var CLIENT_ID = config_1.config.myAnimeList.clientId || '9ea7b9a74b6658e907815ab7e6375323';
var CLIENT_SECRET = config_1.config.myAnimeList.clientSecret || '3dc19780a306163e77e7bba30469a1ba97a25d09e4f229cbe4b3043a134c4704';
var REDIRECT_URI = 'http://localhost:3085/callback';
var TOKEN_FILE = path.join(process.cwd(), 'mal_token.json');
/**
 * Client pour l'API MyAnimeList
 */
var MyAnimeListClient = /** @class */ (function () {
    function MyAnimeListClient() {
    }
    MyAnimeListClient.getInstance = function () {
        if (!MyAnimeListClient.instance) {
            MyAnimeListClient.instance = new MyAnimeListClient();
        }
        return MyAnimeListClient.instance;
    };
    MyAnimeListClient.prototype.saveToken = function (tokenData) {
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    };
    MyAnimeListClient.prototype.loadToken = function () {
        if (!fs.existsSync(TOKEN_FILE))
            return null;
        return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    };
    MyAnimeListClient.prototype.isTokenValid = function (tokenData) {
        if (!(tokenData === null || tokenData === void 0 ? void 0 : tokenData.created_at) || !(tokenData === null || tokenData === void 0 ? void 0 : tokenData.expires_in))
            return false;
        var expiresAt = tokenData.created_at + tokenData.expires_in * 1000;
        return Date.now() < expiresAt;
    };
    MyAnimeListClient.prototype.refreshToken = function (oldToken) {
        return __awaiter(this, void 0, void 0, function () {
            var res, newToken, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.info('Refreshing token...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post('https://myanimelist.net/v1/oauth2/token', new URLSearchParams({
                                client_id: CLIENT_ID,
                                client_secret: CLIENT_SECRET,
                                grant_type: 'refresh_token',
                                refresh_token: oldToken.refresh_token,
                            }), {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            })];
                    case 2:
                        res = _a.sent();
                        newToken = __assign(__assign({}, res.data), { created_at: Date.now() });
                        this.saveToken(newToken);
                        logger.success('Token refreshed');
                        return [2 /*return*/, newToken];
                    case 3:
                        error_1 = _a.sent();
                        logger.error('Failed to refresh token', error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MyAnimeListClient.prototype.base64URLEncode = function (str) {
        return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };
    MyAnimeListClient.prototype.authorize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var codeVerifier, authUrl;
            var _this = this;
            return __generator(this, function (_a) {
                codeVerifier = this.base64URLEncode(crypto.randomBytes(96)).substring(0, 128);
                authUrl = "https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=".concat(CLIENT_ID, "&redirect_uri=").concat(encodeURIComponent(REDIRECT_URI), "&state=request123&code_challenge=").concat(codeVerifier, "&code_challenge_method=plain");
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var server = http.createServer(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var url, code, tokenRes, tokenData, err_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/callback')))
                                            return [2 /*return*/];
                                        url = new URL(req.url, REDIRECT_URI);
                                        code = url.searchParams.get('code');
                                        if (!code) {
                                            res.end('❌ Error: No code received.');
                                            reject(new Error('No code received'));
                                            return [2 /*return*/];
                                        }
                                        res.end('✅ Code received! You can return to the console.');
                                        server.close();
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, axios_1.default.post('https://myanimelist.net/v1/oauth2/token', new URLSearchParams({
                                                client_id: CLIENT_ID,
                                                client_secret: CLIENT_SECRET,
                                                grant_type: 'authorization_code',
                                                code: code,
                                                redirect_uri: REDIRECT_URI,
                                                code_verifier: codeVerifier,
                                            }), {
                                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            })];
                                    case 2:
                                        tokenRes = _b.sent();
                                        tokenData = __assign(__assign({}, tokenRes.data), { created_at: Date.now() });
                                        this.saveToken(tokenData);
                                        logger.success('New token obtained');
                                        resolve(tokenData);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _b.sent();
                                        reject(err_1);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        server.listen(3085, function () {
                            logger.info('Server ready on http://localhost:3085/callback');
                            logger.info('Opening browser for authorization...');
                            open.default(authUrl);
                        });
                    })];
            });
        });
    };
    /**
     * Obtenir un token d'accès valide
     */
    MyAnimeListClient.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenData, refreshed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenData = this.loadToken();
                        if (!tokenData) return [3 /*break*/, 2];
                        if (this.isTokenValid(tokenData)) {
                            return [2 /*return*/, tokenData.access_token];
                        }
                        return [4 /*yield*/, this.refreshToken(tokenData)];
                    case 1:
                        refreshed = _a.sent();
                        if (refreshed)
                            return [2 /*return*/, refreshed.access_token];
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.authorize()];
                    case 3:
                        tokenData = _a.sent();
                        return [2 /*return*/, tokenData.access_token];
                }
            });
        });
    };
    /**
     * Rechercher un manga par titre
     */
    MyAnimeListClient.prototype.searchManga = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var token, url, response, error_2, status_1, statusText;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!title)
                            throw new Error('Title is required');
                        return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _c.sent();
                        url = "https://api.myanimelist.net/v2/manga?q=".concat(encodeURIComponent(title));
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(url, {
                                headers: { Authorization: "Bearer ".concat(token) },
                            })];
                    case 3:
                        response = _c.sent();
                        if (!response.data || !response.data.data || response.data.data.length === 0) {
                            throw new Error('Manga not found in MyAnimeList');
                        }
                        return [2 /*return*/, response.data.data[0].node.id];
                    case 4:
                        error_2 = _c.sent();
                        status_1 = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.status;
                        statusText = ((_b = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _b === void 0 ? void 0 : _b.statusText) || (error_2 === null || error_2 === void 0 ? void 0 : error_2.message);
                        throw new Error("MAL API error ".concat(status_1 || 'ERR', " ").concat(statusText));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtenir les détails d'un manga par son ID
     */
    MyAnimeListClient.prototype.getMangaDetails = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var token, url, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _a.sent();
                        url = "https://api.myanimelist.net/v2/manga/".concat(id, "?fields=main_picture,start_date,end_date,synopsis,mean,updated_at,media_type,status,genres,authors{first_name,last_name}");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(url, {
                                headers: { Authorization: "Bearer ".concat(token) },
                            })];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 4:
                        error_3 = _a.sent();
                        logger.error('Error fetching manga details from MAL', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rechercher et obtenir les détails d'un manga par titre
     */
    MyAnimeListClient.prototype.findMangaByTitle = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManga(title)];
                    case 1:
                        id = _a.sent();
                        return [2 /*return*/, this.getMangaDetails(id)];
                }
            });
        });
    };
    return MyAnimeListClient;
}());
exports.malClient = MyAnimeListClient.getInstance();
