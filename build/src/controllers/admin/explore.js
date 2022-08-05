"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_course_explore_wise = exports.add_explore_course = exports.get_explore_category_wise = exports.delete_explore = exports.get_explore = exports.explore_by_id = exports.update_explore = exports.add_explore = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const S3_1 = require("../../helpers/S3");
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_explore = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.title}$`, "ig");
    let user = req.header("user");
    body.createdBy = user?._id;
    try {
        let isExist = await database_1.exploreModel.findOne({
            title: { $regex: search },
            isActive: true,
        });
        if (isExist) {
            return res
                .status(409)
                .json(new common_1.apiResponse(409, helpers_1.responseMessage?.dataAlreadyExist("explore"), {}));
        }
        let response = await new database_1.exploreModel(body).save();
        if (response)
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.addDataSuccess("explore"), response));
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.addDataError, `${response}`));
    }
    catch (error) {
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_explore = add_explore;
const update_explore = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, exploreId = body?.exploreId, user = req.header("user");
    body.updatedBy = user?._id;
    try {
        delete body?.exploreId;
        let response = await database_1.exploreModel.findOneAndUpdate({ _id: ObjectId(exploreId), isActive: true }, body);
        if (response) {
            if (response.image != null) {
                if (response.image != body?.image) {
                    let [folder_name, image_name] = await (0, common_1.URL_decode)(response?.image);
                    await (0, S3_1.deleteImage)(image_name, folder_name);
                }
            }
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess("explore"), {}));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("explore"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.update_explore = update_explore;
const explore_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.exploreModel.findOne({ _id: ObjectId(id), isActive: true }, { title: 1, image: 1, description: 1, categoryId: 1 });
        if (response) {
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("explore"), response));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("explore"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.explore_by_id = explore_by_id;
const get_explore = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        // let response = await exploreModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await database_1.exploreModel.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $project: {
                    title: 1, image: 1, description: 1, categoryId: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("explore"), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("explore"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_explore = get_explore;
const delete_explore = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        // let response = await exploreModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await database_1.exploreModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.deleteDataSuccess("explore"), response));
        }
        else {
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("explore"), {}));
        }
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.delete_explore = delete_explore;
const get_explore_category_wise = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.exploreModel.find({ categoryId: ObjectId(req.params.id), isActive: true });
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("explore"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_explore_category_wise = get_explore_category_wise;
const add_explore_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let add_feature = await database_1.exploreModel.findOneAndUpdate({ _id: ObjectId(body?.exploreId), isActive: true }, { courseList: body.courseList }, { new: true });
        if (add_feature)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess("explore"), add_feature));
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('explore'), {}));
    }
    catch (error) {
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_explore_course = add_explore_course;
const get_course_explore_wise = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.exploreModel.aggregate([
            { $match: { _id: ObjectId(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: "courses",
                    let: { courseId: "$courseList" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$courseId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "course",
                },
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("explore course data"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_course_explore_wise = get_course_explore_wise;
//# sourceMappingURL=explore.js.map