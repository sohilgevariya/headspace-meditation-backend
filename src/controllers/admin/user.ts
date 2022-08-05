"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, getUser } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import { deleteImage, responseMessage, } from '../../helpers'
import async from 'async'

const ObjectId = require('mongoose').Types.ObjectId

export const get_user_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any, { isBlock, page, limit, search } = req.body, match: any = {}
    try {
        // if (search) {
        //     var usernameArray: Array<any> = []
        //     var emailArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         usernameArray.push({ fullName: { $regex: data, $options: 'si' } })
        //         emailArray.push({ email: { $regex: data, $options: 'si' } })
        //     })
        //     match.$or = [{ $and: usernameArray }, { $and: emailArray }]
        // }
        match.isActive = true
        // match = { ...(isBlock != undefined) && { isBlock }, ...match }
        match.userType = userStatus.user
        response = await userModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (((page as number - 1) * limit as number)) },
                        { $limit: limit as number },
                        { $project: { firstName: 1, lastName: 1, image: 1, email: 1, isUserPremium: 1, isActive: 1, isBlock: 1, loginType: 1, createdAt: 1 } },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ])
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('user'), {
            user_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit) as number) || 1
            }
        }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const get_user_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any, { id } = req.params
    try {
        response = await userModel.findOne({ _id: ObjectId(id), isActive: true, userType: userStatus.user }, { createdAt: 0, updatedAt: 0, deviceToken: 0, authToken: 0, __v: 0, password: 0 })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('user'), response))
        else return res.status(404).json(new apiResponse(200, responseMessage?.getDataNotFound('user'), {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const user_block = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        body: any = req.body, response: any
    try {
        response = await userModel.findOneAndUpdate({ _id: ObjectId(body?.userId), isActive: true }, { isBlock: body?.isBlock }, { new: true }).select('firstName lastName image email isActive isBlock')
        if (response) {
            return res.status(200).json(new apiResponse(200, "User successfully blocked!", response))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('User'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const user_premium = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        body: any = req.body,
        response: any
    try {
        response = await userModel.findOneAndUpdate({ _id: ObjectId(body?.userId), isActive: true }, { isUserPremium: true }, { new: true }).select('name image isUserPremium email userType loginType isBlock')
        if (response) {
            return res.status(200).json(new apiResponse(200, "success!", response))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('User'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}