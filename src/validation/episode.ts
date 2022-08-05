"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { responseMessage } from "../helpers"

export const add_episode = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        courseId: Joi.string().required().error(new Error('courseId is required!')),
        title: Joi.string().required().error(new Error('title is required!')),
        image: Joi.string().required().error(new Error('image is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
        audioOrVideo: Joi.string().required().error(new Error('audioOrVideo is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const update_episode = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        episodeId: Joi.string().required().error(new Error('episodeId is required!')),
        courseId: Joi.string().error(new Error('courseId is objectId!')),
        title: Joi.string().error(new Error('title is string!')),
        description: Joi.string().error(new Error('description is string!')),
        image: Joi.string().error(new Error('image is string!')),
        audioOrVideo: Joi.string().error(new Error('audioOrVideo is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result?.episodeId)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('episodeId'), {}))
        if (!isValidObjectId(result?.courseId)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('courseId'), {}))
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('id'), {}));
    next()
}