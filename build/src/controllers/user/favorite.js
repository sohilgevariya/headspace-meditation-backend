"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_filter_favorite = exports.delete_favorite = exports.get_favorite = exports.add_favorite = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        let existFav = await database_1.favoriteModel.findOne({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId), isActive: true });
        if (existFav != null) {
            await database_1.favoriteModel.deleteOne({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId) });
            return res.status(200).json(new common_1.apiResponse(200, 'Course unfavorited successfully', {}));
        }
        else {
            await new database_1.favoriteModel({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId) }).save();
            return res.status(200).json(new common_1.apiResponse(200, 'Course favorited successfully', {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.add_favorite = add_favorite;
const get_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user')?._id;
    try {
        let response = await database_1.favoriteModel.aggregate([
            { $match: { userId: ObjectId(user), isActive: true } },
            {
                $lookup: {
                    from: "courses",
                    let: { courseId: '$courseId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$courseId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                title: 1,
                                image: 1,
                                description: 1
                            }
                        }
                    ],
                    as: "course"
                }
            },
            {
                $project: {
                    course: { $first: "$course" }
                }
            }
        ]);
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, 'Favorited course', response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Database error', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.get_favorite = get_favorite;
const delete_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user')?._id;
    try {
        let response = await database_1.favoriteModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'Favorite course deleted', {}));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Database error', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.delete_favorite = delete_favorite;
const get_filter_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), { limit, page } = req.body, skip = 0, response = {}, sort = {};
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        sort.createdAt = -1;
        let fav_course = await database_1.favoriteModel.aggregate([
            { $match: { userId: ObjectId(req.header('user')?._id), isActive: true } },
            {
                $lookup: {
                    from: "courses",
                    let: { courseId: '$courseId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$courseId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                title: 1,
                                image: 1,
                                description: 1,
                            }
                        }
                    ],
                    as: "course"
                }
            },
            {
                $facet: {
                    course: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                course: { $first: "$course" }
                            }
                        }
                    ],
                    course_count: [{ $count: "count" }]
                }
            }
        ]);
        response.favorite_course = fav_course[0]?.course || [];
        response.state = {
            page, limit,
            page_limit: Math.ceil(fav_course[0]?.course_count[0]?.count / limit)
        };
        res.status(200).json(new common_1.apiResponse(200, `Get favorite course successfully`, response));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal Server error', error));
    }
};
exports.get_filter_favorite = get_filter_favorite;
//# sourceMappingURL=favorite.js.map