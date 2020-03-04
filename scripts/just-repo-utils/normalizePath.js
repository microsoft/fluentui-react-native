"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/**
 * take a path and make sure it uses forward slashes
 * @param base - path to put into forward slashed form
 */
function normalizePath(base) {
    return path_1.default.normalize(base).replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
