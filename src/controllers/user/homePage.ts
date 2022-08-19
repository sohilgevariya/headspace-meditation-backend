"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, courseModel, episodeModel } from '../../database'
import { adminDeleteAction, apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { deleteImage } from '../../helpers/S3'
import { responseMessage } from '../../helpers'

export const dashboard = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        let getEpisodeData = await episodeModel.aggregate([
            { $match: { isActive: true } },
            {
                $facet: {
                    startYourDay: [
                        { $match: { isMorning: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ],
                    // morning: [
                    //     { $match: { isMorning: 1, isActive: true } },
                    //     { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    // ],
                    afternoonLift: [
                        { $match: { isAfternoon: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ],
                    atNight: [
                        { $match: { isNight: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ]
                }
            }
        ])
        return res.status(200).json(new apiResponse(200, `Get user dashboard successfully`, getEpisodeData))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}