"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null, },
    password: { type: String, default: "$2a$10$7NXu5G6dKmKYIJfiXW/zbeIPUVgMJSfsl3ZBL3OI8OmFVN3120vV." },
    image: { type: String, default: null },
    appleAuthCode: { type: Array, default: [] },
    facebookId: { type: String, default: null },
    isUserPremium: { type: Boolean, default: false },
    authToken: { type: Number, default: 0 },
    deviceToken: { type: [{ type: String }], default: [] },
    loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] },
    userType: { type: Number, default: 0, enum: [0, 1] },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true });
exports.userModel = mongoose.model('user', userSchema);
//# sourceMappingURL=user.js.map