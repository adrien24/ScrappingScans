"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.success = success;
exports.failure = failure;
exports.sleep = sleep;
exports.retryWithBackoff = retryWithBackoff;
exports.sanitizeString = sanitizeString;
exports.formatDateISO = formatDateISO;
/**
 * Logger utilitaire
 */
var Logger = /** @class */ (function () {
    function Logger(context) {
        this.context = context;
    }
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArray(["[".concat(this.context, "] \u2139\uFE0F  ").concat(message)], args, false));
    };
    Logger.prototype.success = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArray(["[".concat(this.context, "] \u2705 ").concat(message)], args, false));
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray(["[".concat(this.context, "] \u26A0\uFE0F  ").concat(message)], args, false));
    };
    Logger.prototype.error = function (message, error) {
        console.error("[".concat(this.context, "] \u274C ").concat(message), error);
    };
    Logger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (process.env.NODE_ENV === 'development') {
            console.debug.apply(console, __spreadArray(["[".concat(this.context, "] \uD83D\uDC1B ").concat(message)], args, false));
        }
    };
    return Logger;
}());
exports.Logger = Logger;
/**
 * Créer un Result success
 */
function success(data) {
    return { success: true, data: data };
}
/**
 * Créer un Result error
 */
function failure(error) {
    return { success: false, error: error };
}
/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
/**
 * Retry une fonction avec backoff exponentiel
 */
function retryWithBackoff(fn_1) {
    return __awaiter(this, arguments, void 0, function (fn, maxRetries, initialDelay, backoffFactor) {
        var lastError, attempt, error_1, delay;
        if (maxRetries === void 0) { maxRetries = 3; }
        if (initialDelay === void 0) { initialDelay = 1000; }
        if (backoffFactor === void 0) { backoffFactor = 2; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxRetries)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 7]);
                    return [4 /*yield*/, fn()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_1 = _a.sent();
                    lastError = error_1;
                    if (!(attempt < maxRetries)) return [3 /*break*/, 6];
                    delay = initialDelay * Math.pow(backoffFactor, attempt);
                    return [4 /*yield*/, sleep(delay)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 7];
                case 7:
                    attempt++;
                    return [3 /*break*/, 1];
                case 8: throw lastError;
            }
        });
    });
}
/**
 * Nettoyer une chaîne de caractères
 */
function sanitizeString(str) {
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/gi, '');
}
/**
 * Formater une date en ISO string
 */
function formatDateISO(date) {
    if (date === void 0) { date = new Date(); }
    return date.toISOString();
}
