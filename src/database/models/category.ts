const mongoose = require('mongoose')

const categorySchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true }
)

export const categoryModel = mongoose.model('category', categorySchema);