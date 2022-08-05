"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { categoryModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { deleteImage } from '../../helpers/S3'
import { responseMessage } from '../../helpers'

const ObjectId = mongoose.Types.ObjectId

export const add_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    let user: any = req.header('user')
    try {
        let isExist = await categoryModel.findOne({ name: { $regex: search }, isActive: true })
        if (isExist) {
            return res.status(409).json(new apiResponse(409, responseMessage?.dataAlreadyExist('category'), {}))
        }
        let response = await new categoryModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('category'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, `${response}`))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const update_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        categoryId = body?.categoryId,
        user: any = req.header('user')
    try {
        delete body?.categoryId
        let response = await categoryModel.findOneAndUpdate({ _id: ObjectId(categoryId), isActive: true }, body)
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('category'), {}))
        }
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('category'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

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

export const delete_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = req.params.id
    try {
        let response = await categoryModel.findByIdAndDelete({ _id: ObjectId(id) })
        if (response) {
            await categoryModel.findOneAndDelete({ categoryId: ObjectId(id), isActive: true });
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('category'), response))
        }
        else {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('category'), {},))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}