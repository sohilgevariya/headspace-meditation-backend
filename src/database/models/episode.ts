const mongoose = require('mongoose')

const episodeSchema: any = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    title: { type: String, default: null },
    image: { type: String, default: null, },
    description: { type: String, default: null },
    audioOrVideo: { type: String, default: null },
    isMorning: { type: Number, default: 0, enum: [0, 1, 2] },
    isAfternoon: { type: Number, default: 0, enum: [0, 1, 2] },
    isNight: { type: Number, default: 0, enum: [0, 1, 2] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true }
)

export const episodeModel = mongoose.model('episode', episodeSchema);