"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const dashboard = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user');
    try {
        return res.status(200).json(new common_1.apiResponse(200, `Get admin dashboard successfully`, {
            users: await database_1.userModel.countDocuments({ isActive: true, isBlock: false, userType: common_1.userStatus.user }),
            video: await database_1.courseModel.countDocuments({ isActive: true }),
        }));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.dashboard = dashboard;
//# sourceMappingURL=dashboard.js.map