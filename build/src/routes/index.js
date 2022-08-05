"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_1 = require("./user");
const upload_1 = require("./upload");
const admin_1 = require("./admin");
const common_1 = require("../common");
const router = (0, express_1.Router)();
exports.router = router;
const accessControl = (req, res, next) => {
    req.headers.userType = common_1.userStatus[req.originalUrl.split('/')[1]];
    next();
};
router.use(accessControl);
router.use('/user', user_1.userRouter);
router.use('/upload', upload_1.uploadRouter);
router.use('/admin', admin_1.adminRouter);
//# sourceMappingURL=index.js.map