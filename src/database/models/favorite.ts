var mongoose = require('mongoose')
const favoriteSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true })

export const favoriteModel = mongoose.model('favorite', favoriteSchema)