"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { favoriteModel } from '../../database'
import { adminDeleteAction, apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import config from "config";
const ObjectId = mongoose.Types.ObjectId

export const add_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        let existFav = await favoriteModel.findOne({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId), isActive: true })
        if (existFav != null) {
            await favoriteModel.deleteOne({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId) })
            return res.status(200).json(new apiResponse(200, 'Course unfavorited successfully', {}));
        }
        else {
            await new favoriteModel({ userId: ObjectId(user._id), courseId: ObjectId(body.courseId) }).save()
            return res.status(200).json(new apiResponse(200, 'Course favorited successfully', {}));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
    }
}

export const get_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await favoriteModel.aggregate([
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
        ])
        if (response) {
            return res.status(200).json(new apiResponse(200, 'Favorited course', response))
        }
        else return res.status(400).json(new apiResponse(400, 'Database error', {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
    }
}

export const delete_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await favoriteModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Favorite course deleted', {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
    }
}

export const get_filter_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { limit, page } = req.body,
        skip = 0,
        response: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        sort.createdAt = -1
        let fav_course = await favoriteModel.aggregate([
            { $match: { userId: ObjectId((req.header('user') as any)?._id), isActive: true } },
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
        response.favorite_course = fav_course[0]?.course || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(fav_course[0]?.course_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get favorite course successfully`, response))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal Server error', error))
    }
}