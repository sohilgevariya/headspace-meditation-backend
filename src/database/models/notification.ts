var mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    image: { type: String, default: null },
    notificationData: { type: Object, default: {} },
    notificationType: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    receiveBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
}, { timestamps: true })

export const notificationModel = mongoose.model('notification', notificationSchema)