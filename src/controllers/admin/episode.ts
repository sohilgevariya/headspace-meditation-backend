"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { favoriteModel, episodeModel } from '../../database'
import { adminDeleteAction, apiResponse, emailTemplates, storeStatus, URL_decode } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { deleteImage } from '../../helpers/S3'
import { responseMessage } from '../../helpers'

const ObjectId = mongoose.Types.ObjectId

export const add_episode = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.title}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user?._id
    try {
        let isExist = await episodeModel.findOne({ courseId: ObjectId(body?.courseId), title: { $regex: search }, isActive: true })
        if (isExist) {
            return res.status(409).json(new apiResponse(409, responseMessage?.dataAlreadyExist('episode'), {}))
        }
        let response = await new episodeModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('episode'), response))
        else return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, `${response}`))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const update_episode = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        episodeId = body?.episodeId,
        user: any = req.header('user')
    body.updatedBy = user?._id
    try {
        delete body?.episodeId
        let response = await episodeModel.findOneAndUpdate({ _id: ObjectId(episodeId), isActive: true }, body)
        if (response) {
            if (response.audioOrVideo != null) {
                if (response.audioOrVideo != body?.audioOrVideo) {
                    let [folder_name, audioOrVideo_name] = await URL_decode(response?.audioOrVideo)
                    await deleteImage(audioOrVideo_name, folder_name)
                }
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('episode'), {}))
        }
        else return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('episode'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

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

export const delete_episode = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = req.params.id
    try {
        // let response = await episodeModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await episodeModel.findByIdAndDelete({ _id: ObjectId(id) })
        if (response) {
            await favoriteModel.findOneAndDelete({ episodeId: ObjectId(id), isActive: true });
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('episode'), response))
        }
        else {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('episode'), {},))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const get_episode_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any, { page, limit, courseId, search } = req.body, match: any = {}
    try {
        // if (search) {
        //     var titleArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         titleArray.push({ title: { $regex: data, $options: 'si' } })
        //     })
        //     match.$or = [{ $and: titleArray }]
        // }
        match.isActive = true
        if (courseId) match.courseId = ObjectId(courseId)
        response = await episodeModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (((page as number - 1) * limit as number)) },
                        { $limit: limit as number },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1, isActive: 1, createdAt: 1 } },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ])
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('episode'), {
            episode_data: response[0]?.data,
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

export const add_morning_episode = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    try {
        let add_morning_meditation = await episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isMorning: 1 })
        if (add_morning_meditation) {
            await episodeModel.updateMany({ isMorning: 1 }, { isMorning: 2 })
            return res.status(200).json(new apiResponse(200, "Meditation added in morning", {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('episode'), {}))
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const add_afternoon_episode = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    try {
        let add_afternoon_meditation = await episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isAfternoon: 1 })
        if (add_afternoon_meditation) {
            await episodeModel.updateMany({ isAfternoon: 1 }, { isAfternoon: 2 })
            return res.status(200).json(new apiResponse(200, 'Meditation added in afternoon', {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('episode'), {}))
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const add_night_episode = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    try {
        let add_night_meditation = await episodeModel.findOneAndUpdate({ _id: ObjectId(body?.episodeId), isActive: true }, { isNight: 1 })
        if (add_night_meditation) {
            await episodeModel.updateMany({ isNight: 1 }, { isNight: 2 })
            return res.status(200).json(new apiResponse(200, 'Meditation added in night', {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('episode'), {}))
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
};

export const get_episode_not_selected = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response: any = await episodeModel.find({ isMorning: 0, isAfternoon: 0, isNight: 0, isActive: true }, { title: 1 })
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("episode"), response))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}));
    }
};