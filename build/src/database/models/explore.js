"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreModel = void 0;
const mongoose = require('mongoose');
const exploreSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    title: { type: String, default: null },
    image: { type: String, default: null, },
    description: { type: String, default: null },
    courseList: { type: [{ type: mongoose.Schema.Types.ObjectId }], default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true });
exports.exploreModel = mongoose.model('explore', exploreSchema);
//# sourceMappingURL=explore.js.map