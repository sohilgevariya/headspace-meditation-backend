"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, courseModel } from '../../database'
import { adminDeleteAction, apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { deleteImage } from '../../helpers/S3'
import { responseMessage } from '../../helpers'

export const dashboard = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        return res.status(200).json(new apiResponse(200, `Get admin dashboard successfully`, {
            users: await userModel.countDocuments({ isActive: true, isBlock: false, userType: userStatus.user }),
            video: await courseModel.countDocuments({ isActive: true }),
        }))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}