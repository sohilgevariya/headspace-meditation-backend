"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteModel = void 0;
var mongoose = require('mongoose');
const favoriteSchema = new mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });
exports.favoriteModel = mongoose.model('favorite', favoriteSchema);
//# sourceMappingURL=favorite.js.map