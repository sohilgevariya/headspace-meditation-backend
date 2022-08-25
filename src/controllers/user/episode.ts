"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { episodeModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { responseMessage } from '../../helpers'

const ObjectId = mongoose.Types.ObjectId

export const episode_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params
    try {
        let response = await episodeModel.findOne({ _id: ObjectId(id), isActive: true }, { title: 1, image: 1, description: 1, audioOrVideo: 1 })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('episode'), response))
        }
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('episode'), {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const get_episode = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await episodeModel.find({ isActive: true }, { title: 1, image: 1, description: 1, audioOrVideo: 1 }).sort({ createdAt: -1 })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('episode'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('episode'), {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const get_episode_by_course = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any
    try {
        response = await episodeModel.find({ courseId: ObjectId(req.params.id), isActive: true })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('episode'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('episode'), response))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}