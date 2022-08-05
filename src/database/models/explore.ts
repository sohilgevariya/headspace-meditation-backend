const mongoose = require('mongoose')

const exploreSchema: any = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    title: { type: String, default: null },
    image: { type: String, default: null, },
    description: { type: String, default: null },
    courseList: { type: [{ type: mongoose.Schema.Types.ObjectId }], default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true }
)

export const exploreModel = mongoose.model('explore', exploreSchema);