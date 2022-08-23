const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    mobileNumber: { type: String, default: null },
    password: { type: String, default: "$2a$10$7NXu5G6dKmKYIJfiXW/zbeIPUVgMJSfsl3ZBL3OI8OmFVN3120vV." },
    image: { type: String, default: null },
    appleAuthCode: { type: Array, default: [] },
    facebookId: { type: String, default: null },
    isUserPremium: { type: Boolean, default: false },
    authToken: { type: Number, default: 0 },
    otp: { type: Number, default: 0 },
    otpExpireTime: { type: Date, default: 0 },
    deviceToken: { type: [{ type: String }], default: [] },
    loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] }, // 0 - custom || 1 - google || 2 - facebook || 3 - apple
    userType: { type: Number, default: 0, enum: [0, 1] }, // 0 - user || 1 - admin 
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true }
)

export const userModel = mongoose.model('user', userSchema);

export interface getUser {
    name: string;
    email: string;
    image: string;
    isActive: boolean;
}