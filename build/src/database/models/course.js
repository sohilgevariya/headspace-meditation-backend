"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseModel = void 0;
const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    title: { type: String, default: null },
    image: { type: String, default: null, },
    description: { type: String, default: null },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true });
exports.courseModel = mongoose.model('course', courseSchema);
//# sourceMappingURL=course.js.map