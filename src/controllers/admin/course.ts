"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { favoriteModel, courseModel, exploreModel } from "../../database";
import {
    adminDeleteAction,
    apiResponse,
    emailTemplates,
    storeStatus,
    URL_decode,
} from "../../common";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { deleteImage } from "../../helpers/S3";
import { responseMessage } from "../../helpers";

const ObjectId = mongoose.Types.ObjectId;

export const add_course = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        search = new RegExp(`^${body.title}$`, "ig");
    let user: any = req.header("user");
    body.createdBy = user?._id;
    try {
        let isExist = await courseModel.findOne({
            title: { $regex: search },
            isActive: true,
        });
        if (isExist) {
            return res
                .status(409)
                .json(
                    new apiResponse(409, responseMessage?.dataAlreadyExist("course"), {})
                );
        }
        let response = await new courseModel(body).save();
        if (response)
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.addDataSuccess("course"),
                        response
                    )
                );
        else
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.addDataError, `${response}`)
                );
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const update_course = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        courseId = body?.courseId,
        user: any = req.header("user");
    body.updatedBy = user?._id;
    try {
        delete body?.courseId;
        let response = await courseModel.findOneAndUpdate(
            { _id: ObjectId(courseId), isActive: true },
            body
        );
        if (response) {
            if (response.image != null) {
                if (response.image != body?.image) {
                    let [folder_name, image_name] = await URL_decode(response?.image);
                    await deleteImage(image_name, folder_name);
                }
            }
            return res
                .status(200)
                .json(
                    new apiResponse(200, responseMessage?.updateDataSuccess("course"), {})
                );
        } else
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("course"), {})
                );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const course_by_id = async (req: Request, res: Response) => {
    reqInfo(req);
    let { id } = req.params;
    try {
        let response = await courseModel.findOne(
            { _id: ObjectId(id), isActive: true },
            { title: 1, image: 1, description: 1, categoryId: 1 }
        );
        if (response) {
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.getDataSuccess("course"),
                        response
                    )
                );
        } else
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("course"), {})
                );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_course = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        // let response = await courseModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await courseModel.aggregate([
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
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course"), response));
        else
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound("course"), {}));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_course_search = async (req: Request, res: Response) => {
    reqInfo(req);
    let { search } = req.body, match: any = {}
    try {
        if (search) {
            var titleArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }]
        }
        // let response = await courseModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await courseModel.aggregate([
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
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course"), response));
        else
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound("course"), {}));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const delete_course = async (req: Request, res: Response) => {
    reqInfo(req);
    let id = req.params.id;
    try {
        // let response = await courseModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await courseModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            if (response.image != null || response.image != "") {
                let [folder_name, image_name] = await URL_decode(response?.image);
                await deleteImage(image_name, folder_name);
            }
            await favoriteModel.deleteMany({
                courseId: ObjectId(id),
                isActive: true,
            });
            // await exploreModel.deleteMany({
            //     courseList: { $in: [ObjectId(id)] },
            //     isActive: true,
            // });
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.deleteDataSuccess("course"),
                        response
                    )
                );
        } else {
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("course"), {})
                );
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_course_pagination = async (req: Request, res: Response) => {
    reqInfo(req);
    let response: any,
        { page, limit, search } = req.body,
        match: any = {};
    try {
        if (search) {
            var titleArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }]
        }
        match.isActive = true;
        response = await courseModel.aggregate([
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
                        { $skip: (((page as number) - 1) * limit) as number },
                        { $limit: limit as number },
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
        return res.status(200).json(
            new apiResponse(200, responseMessage?.getDataSuccess("course"), {
                course_data: response[0]?.data,
                state: {
                    page: req.body?.page,
                    limit: req.body?.limit,
                    page_limit:
                        Math.ceil(
                            (response[0]?.data_count[0]?.count / req.body?.limit) as number
                        ) || 1,
                },
            })
        );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};

export const get_course_category_wise = async (req: Request, res: Response) => {
    reqInfo(req);
    let { id, search } = req.body, match: any = {}
    try {
        if (search) {
            var titleArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }]
        }
        // let response: any = await courseModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
        let response: any = await courseModel.aggregate([
            { $match: { categoryId: ObjectId(id), isActive: true, ...match } },
        ])
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course"), response))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};

export const add_course_feature = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    try {
        let add_feature = await courseModel.findOneAndUpdate({ _id: ObjectId(body?.courseId), isActive: true }, { isFeatured: body?.isFeatured }, { new: true })
        if (add_feature) return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("course"), add_feature))
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('course'), {}))
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_category_wise_course = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response: any = await courseModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("course"), response))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};