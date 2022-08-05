"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_favorite = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const google_api_key = config_1.default.get("google_api_key");
const add_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        let existFav = await database_1.favoriteModel.findOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId), isActive: true });
        if (existFav != null) {
            await database_1.favoriteModel.deleteOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) });
            return res.status(200).json(new common_1.apiResponse(200, 'Video unfavorited successfully', {}));
        }
        else {
            await new database_1.favoriteModel({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) }).save();
            return res.status(200).json(new common_1.apiResponse(200, 'Video favorited successfully', {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.add_favorite = add_favorite;
//# sourceMappingURL=favorite.js.map