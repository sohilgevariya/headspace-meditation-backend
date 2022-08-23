"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_night_episode = exports.get_afternoon_episode = exports.get_morning_episode = exports.add_night_episode = exports.add_afternoon_episode = exports.add_morning_episode = exports.get_episode_by_course = exports.get_episode_pagination = exports.delete_episode = exports.get_episode = exports.episode_by_id = exports.update_episode = exports.add_episode = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const S3_1 = require("../../helpers/S3");
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.title}$`, "ig");
    let user = req.header('user');
    body.createdBy = user?._id;
    try {
        let isExist = await database_1.episodeModel.findOne({ courseId: ObjectId(body?.courseId), title: { $regex: search }, isActive: true });
        if (isExist) {
            return res.status(409).json(new common_1.apiResponse(409, helpers_1.responseMessage?.dataAlreadyExist('episode'), {}));
        }
        let response = await new database_1.episodeModel(body).save();
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.addDataSuccess('episode'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.addDataError, `${response}`));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_episode = add_episode;
const update_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, episodeId = body?.episodeId, user = req.header('user');
    body.updatedBy = user?._id;
    try {
        delete body?.episodeId;
        let response = await database_1.episodeModel.findOneAndUpdate({ _id: ObjectId(episodeId), isActive: true }, body);
        if (response) {
            if (response.audioOrVideo != null) {
                if (response.audioOrVideo != body?.audioOrVideo) {
                    let [folder_name, audioOrVideo_name] = await (0, common_1.URL_decode)(response?.audioOrVideo);
                    await (0, S3_1.deleteImage)(audioOrVideo_name, folder_name);
                }
            }
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess('episode'), {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('episode'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.update_episode = update_episode;
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
const delete_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        // let response = await episodeModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await database_1.episodeModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            await database_1.favoriteModel.findOneAndDelete({ episodeId: ObjectId(id), isActive: true });
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.deleteDataSuccess('episode'), response));
        }
        else {
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('episode'), {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.delete_episode = delete_episode;
const get_episode_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response, { page, limit, courseId, search } = req.body, match = {};
    try {
        // if (search) {
        //     var titleArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         titleArray.push({ title: { $regex: data, $options: 'si' } })
        //     })
        //     match.$or = [{ $and: titleArray }]
        // }
        match.isActive = true;
        if (courseId)
            match.courseId = ObjectId(courseId);
        response = await database_1.episodeModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1, isActive: 1, createdAt: 1 } },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('episode'), {
            episode_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit)) || 1
            }
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_episode_pagination = get_episode_pagination;
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
const add_morning_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { episodeIds } = req.body;
    try {
        // let add_morning_meditation = await episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isMorning: 1 })
        episodeIds = episodeIds.map(s => ObjectId(s));
        let add_morning_meditation = await database_1.episodeModel.updateMany({ _id: { $in: episodeIds }, isActive: true }, { isMorning: 1 });
        if (add_morning_meditation) {
            await database_1.episodeModel.updateMany({ _id: { $nin: episodeIds }, isMorning: 1 }, { isMorning: 2 });
            return res.status(200).json(new common_1.apiResponse(200, "Meditation added in morning", {}));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('episode'), {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_morning_episode = add_morning_episode;
const add_afternoon_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let add_afternoon_meditation = await database_1.episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isAfternoon: 1 });
        if (add_afternoon_meditation) {
            await database_1.episodeModel.updateMany({ _id: { $ne: ObjectId(body?.episodeId) }, isAfternoon: 1 }, { isAfternoon: 2 });
            return res.status(200).json(new common_1.apiResponse(200, 'Meditation added in afternoon', {}));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('episode'), {}));
    }
    catch (error) {
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_afternoon_episode = add_afternoon_episode;
const add_night_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let add_night_meditation = await database_1.episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isNight: 1 });
        if (add_night_meditation) {
            await database_1.episodeModel.updateMany({ _id: { $ne: ObjectId(body?.episodeId) }, isNight: 1 }, { isNight: 2 });
            return res.status(200).json(new common_1.apiResponse(200, 'Meditation added in night', {}));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('episode'), {}));
    }
    catch (error) {
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_night_episode = add_night_episode;
const get_morning_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        // let response: any = await episodeModel.find({ $or: [{ isMorning: 0 }, { isMorning: 1 }], isAfternoon: 0, isNight: 0, isActive: true }, { title: 1, isMorning: 1 })
        let response = await database_1.episodeModel.find({ isActive: true }, { title: 1, isMorning: 1 });
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("episode"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_morning_episode = get_morning_episode;
const get_afternoon_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        // let response: any = await episodeModel.find({ $or: [{ isAfternoon: 0 }, { isAfternoon: 1 }], isMorning: 0, isNight: 0, isActive: true }, { title: 1, isAfternoon: 1 })
        let response = await database_1.episodeModel.find({ isActive: true }, { title: 1, isAfternoon: 1 });
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("episode"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_afternoon_episode = get_afternoon_episode;
const get_night_episode = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        // let response: any = await episodeModel.find({ $or: [{ isNight: 0 }, { isNight: 1 }], isAfternoon: 0, isMorning: 0, isActive: true }, { title: 1, isNight: 1 })
        let response = await database_1.episodeModel.find({ isActive: true }, { title: 1, isNight: 1 });
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("episode"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_night_episode = get_night_episode;
//# sourceMappingURL=episode.js.map