"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryModel = void 0;
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.categoryModel = mongoose.model('category', categorySchema);
//# sourceMappingURL=category.js.map