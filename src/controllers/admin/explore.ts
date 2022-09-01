"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { favoriteModel, exploreModel } from "../../database";
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

export const add_explore = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        search = new RegExp(`^${body.title}$`, "ig");
    let user: any = req.header("user");
    body.createdBy = user?._id;
    try {
        let isExist = await exploreModel.findOne({
            title: { $regex: search },
            isActive: true,
        });
        if (isExist) {
            return res
                .status(409)
                .json(
                    new apiResponse(409, responseMessage?.dataAlreadyExist("explore"), {})
                );
        }
        let response = await new exploreModel(body).save();
        if (response)
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.addDataSuccess("explore"),
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

export const update_explore = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        exploreId = body?.exploreId,
        user: any = req.header("user");
    body.updatedBy = user?._id;
    try {
        delete body?.exploreId;
        let response = await exploreModel.findOneAndUpdate(
            { _id: ObjectId(exploreId), isActive: true },
            body
        );
        if (response) {
            // if (response.image != null) {
            //     if (response.image != body?.image) {
            //         let [folder_name, image_name] = await URL_decode(response?.image);
            //         await deleteImage(image_name, folder_name);
            //     }
            // }
            return res
                .status(200)
                .json(
                    new apiResponse(200, responseMessage?.updateDataSuccess("explore"), {})
                );
        } else
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("explore"), {})
                );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const explore_by_id = async (req: Request, res: Response) => {
    reqInfo(req);
    let { id } = req.params;
    try {
        let response = await exploreModel.findOne(
            { _id: ObjectId(id), isActive: true },
            { title: 1, image: 1, description: 1, categoryId: 1 }
        );
        if (response) {
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.getDataSuccess("explore"),
                        response
                    )
                );
        } else
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("explore"), {})
                );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_explore = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        // let response = await exploreModel.find({ isActive: true }, { title: 1, image: 1, description: 1, }).sort({ createdAt: -1 })
        let response = await exploreModel.aggregate([
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
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("explore"), response));
        else
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound("explore"), {}));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const delete_explore = async (req: Request, res: Response) => {
    reqInfo(req);
    let id = req.params.id;
    try {
        // let response = await exploreModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await exploreModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        responseMessage?.deleteDataSuccess("explore"),
                        response
                    )
                );
        } else {
            return res
                .status(400)
                .json(
                    new apiResponse(400, responseMessage?.getDataNotFound("explore"), {})
                );
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_explore_category_wise = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response: any = await exploreModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("explore"), response))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};

export const add_explore_course = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    try {
        let add_feature = await exploreModel.findOneAndUpdate({ _id: ObjectId(body?.exploreId), isActive: true }, { courseList: body.courseList }, { new: true })
        if (add_feature) return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("explore"), add_feature))
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('explore'), {}))
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_course_explore_wise = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response: any = await exploreModel.aggregate([
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
        ])
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("explore course data"), response))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};