"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_category_wise_course = exports.add_course_feature = exports.get_course_category_wise = exports.get_course_pagination = exports.delete_course = exports.get_course_search = exports.get_course = exports.course_by_id = exports.update_course = exports.add_course = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const S3_1 = require("../../helpers/S3");
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.title}$`, "ig");
    let user = req.header("user");
    body.createdBy = user?._id;
    try {
        let isExist = await database_1.courseModel.findOne({
            title: { $regex: search },
            isActive: true,
        });
        if (isExist) {
            return res
                .status(409)
                .json(new common_1.apiResponse(409, helpers_1.responseMessage?.dataAlreadyExist("course"), {}));
        }
        let response = await new database_1.courseModel(body).save();
        if (response)
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.addDataSuccess("course"), response));
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
exports.add_course = add_course;
const update_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, courseId = body?.courseId, user = req.header("user");
    body.updatedBy = user?._id;
    try {
        delete body?.courseId;
        let response = await database_1.courseModel.findOneAndUpdate({ _id: ObjectId(courseId), isActive: true }, body);
        if (response) {
            if (response.image != null) {
                if (response.image != body?.image) {
                    let [folder_name, image_name] = await (0, common_1.URL_decode)(response?.image);
                    await (0, S3_1.deleteImage)(image_name, folder_name);
                }
            }
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess("course"), {}));
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
exports.update_course = update_course;
const course_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.courseModel.findOne({ _id: ObjectId(id), isActive: true }, { title: 1, image: 1, description: 1, categoryId: 1 });
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
exports.course_by_id = course_by_id;
const get_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        // let response = await courseModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await database_1.courseModel.aggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: "episodes",
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
                        {
                            $count: "count"
                        }
                    ],
                    as: "episode",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$categoryId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        }
                    ],
                    as: "category",
                },
            },
            {
                $project: {
                    title: 1, image: 1, description: 1, categoryId: 1, episodeCount: { $first: "$episode.count" }, category: { $first: "$category.name" },
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("course"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_course = get_course;
const get_course_search = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { search } = req.body, match = {};
    try {
        if (search) {
            var titleArray = [];
            search = search.split(" ");
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } });
            });
            match.$or = [{ $and: titleArray }];
        }
        // let response = await courseModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await database_1.courseModel.aggregate([
            {
                $match: {
                    isActive: true, ...match
                },
            },
            {
                $lookup: {
                    from: "episodes",
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
                        {
                            $count: "count"
                        }
                    ],
                    as: "episode",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$categoryId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        }
                    ],
                    as: "category",
                },
            },
            {
                $project: {
                    title: 1, image: 1, description: 1, categoryId: 1, episodeCount: { $first: "$episode.count" }, category: { $first: "$category.name" },
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("course"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_course_search = get_course_search;
const delete_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        // let response = await courseModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await database_1.courseModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            if (response.image != null || response.image != "") {
                let [folder_name, image_name] = await (0, common_1.URL_decode)(response?.image);
                await (0, S3_1.deleteImage)(image_name, folder_name);
            }
            await database_1.favoriteModel.deleteMany({
                courseId: ObjectId(id),
                isActive: true,
            });
            // await exploreModel.deleteMany({
            //     courseList: { $in: [ObjectId(id)] },
            //     isActive: true,
            // });
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.deleteDataSuccess("course"), response));
        }
        else {
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("course"), {}));
        }
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.delete_course = delete_course;
const get_course_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response, { page, limit, search } = req.body, match = {};
    try {
        if (search) {
            var titleArray = [];
            search = search.split(" ");
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } });
            });
            match.$or = [{ $and: titleArray }];
        }
        match.isActive = true;
        response = await database_1.courseModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "episodes",
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
                        {
                            $count: "count"
                        }
                    ],
                    as: "episode",
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
                                categoryId: 1,
                                isActive: 1,
                                createdAt: 1,
                                episodeCount: { $first: "$episode.count" }
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
exports.get_course_pagination = get_course_pagination;
const get_course_category_wise = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id, search } = req.body, match = {};
    try {
        if (search) {
            var titleArray = [];
            search = search.split(" ");
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } });
            });
            match.$or = [{ $and: titleArray }];
        }
        // let response: any = await courseModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
        let response = await database_1.courseModel.aggregate([
            { $match: { categoryId: ObjectId(id), isActive: true, ...match } },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_course_category_wise = get_course_category_wise;
const add_course_feature = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let add_feature = await database_1.courseModel.findOneAndUpdate({ _id: ObjectId(body?.courseId), isActive: true }, { isFeatured: body?.isFeatured }, { new: true });
        if (add_feature)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess("course"), add_feature));
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('course'), {}));
    }
    catch (error) {
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_course_feature = add_course_feature;
const get_category_wise_course = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.courseModel.find({ categoryId: ObjectId(req.params.id), isActive: true });
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("course"), response));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_category_wise_course = get_category_wise_course;
//# sourceMappingURL=course.js.map