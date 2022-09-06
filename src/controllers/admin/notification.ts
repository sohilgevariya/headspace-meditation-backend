"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { notificationModel, userModel, userSessionModel } from '../../database'
import { apiResponse, userStatus, getArea, URL_decode, notification_types } from '../../common'
import { Request, Response } from 'express'
import { responseMessage } from '../../helpers/response'
import { notification_to_user } from '../../helpers/notification'

const ObjectId = require('mongoose').Types.ObjectId

export const add_notification = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'), { title, description, image } = req.body
    try {
        let add_notification: any = await notification_types.add_notification({ title: title, description: description, image: image })
        let response = await new notificationModel({
            title: title,
            description: description,
            image: image,
            notificationData: add_notification?.data,
            notificationType: 0,
            createdBy: ObjectId(user?._id),
        }).save()
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('notification'), response));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const get_notification = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        let response: any = await notificationModel.aggregate([
            { $match: { receiveBy: ObjectId(user?._id), isActive: true } },
            {
                $lookup: {
                    from: "users",
                    let: { receiveBy: "$receiveBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$receiveBy'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                }
                            }
                        },
                        { $project: { firstName: 1, lastName: 1, email: 1, phoneNumber: 1, userType: 1, } },
                    ],
                    as: "user"
                }
            },
        ])
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('notification'), response));
        else return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}
