"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_episode_by_course = exports.get_episode = exports.episode_by_id = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const episode_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.episodeModel.findOne({ _id: ObjectId(id), isActive: true }, { title: 1, image: 1, description: 1, audioOrVideo: 1 });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('episode'), response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('episode'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.episode_by_id = episode_by_id;
const get_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.episodeModel.find({ isActive: true }, { title: 1, image: 1, description: 1, audioOrVideo: 1 }).sort({ createdAt: -1 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('episode'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('episode'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_episode = get_episode;
const get_episode_by_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response;
    try {
        response = await database_1.episodeModel.find({ courseId: ObjectId(req.params.id), isActive: true });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('episode'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('episode'), response));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_episode_by_course = get_episode_by_course;
//# sourceMappingURL=episode.js.map