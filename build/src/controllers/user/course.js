"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_all_course_pagination = exports.get_all_course = exports.course_by_id_detail = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const google_api_key = config_1.default.get("google_api_key");
const course_by_id_detail = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    let user = req.header("user");
    try {
        let response = await database_1.courseModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "favorites",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$courseId", "$$courseId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $project: {
                    title: 1,
                    image: 1,
                    description: 1,
                    isPremium: 1,
                    isFavorite: {
                        $cond: {
                            if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ]);
        if (response) {
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), response));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("course"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.course_by_id_detail = course_by_id_detail;
const get_all_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header("user");
    try {
        let response = await database_1.courseModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "favorites",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$courseId", "$$courseId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $project: {
                    title: 1,
                    image: 1,
                    description: 1,
                    isPremium: 1,
                    isFavorite: {
                        $cond: {
                            if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        if (response) {
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), {}));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("course"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_all_course = get_all_course;
const get_all_course_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header("user");
    let response, { page, limit, search } = req.body, match = {};
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
        response = await database_1.courseModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "favorites",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$courseId", "$$courseId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: ((page - 1) * limit) },
                        { $limit: limit },
                        {
                            $project: {
                                title: 1,
                                image: 1,
                                description: 1,
                                isPremium: 1,
                                isActive: 1,
                                createdAt: 1,
                                isFavorite: {
                                    $cond: {
                                        if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                                        then: true,
                                        else: false,
                                    },
                                },
                            },
                        },
                    ],
                    data_count: [{ $count: "count" }],
                },
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), {
            course_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil((response[0]?.data_count[0]?.count / req.body?.limit)) || 1,
            },
        }));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_all_course_pagination = get_all_course_pagination;
//# sourceMappingURL=course.js.map