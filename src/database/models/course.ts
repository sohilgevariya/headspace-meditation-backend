const mongoose = require('mongoose')

const courseSchema: any = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    title: { type: String, default: null },
    image: { type: String, default: null, },
    description: { type: String, default: null },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true }
)

export const courseModel = mongoose.model('course', courseSchema);