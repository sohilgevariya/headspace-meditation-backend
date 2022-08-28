"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { categoryModel, courseModel, exploreModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { deleteImage } from '../../helpers/S3'
import { responseMessage } from '../../helpers'

const ObjectId = mongoose.Types.ObjectId

export const category_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params
    try {
        let response = await categoryModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1 })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('category'), response))
        }
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('category'), {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const get_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await categoryModel.find({ isActive: true }, { name: 1 }).sort({ createdAt: -1 })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('category'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('category'), {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const get_featured_category_course = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any
    try {
        response = await courseModel.find({ categoryId: ObjectId(req.params.id), isFeatured: true, isActive: true })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('featured category'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('featured category'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const get_explore_category_course = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any
    try {
        // response = await exploreModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
        response = await exploreModel.aggregate([
            { $match: { categoryId: ObjectId(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: "courses",
                    let: { courseList: '$courseList' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$_id', '$$courseList'] },
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
                    as: "courseList"
                }
            },
        ])
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('explore category'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('explore category'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}