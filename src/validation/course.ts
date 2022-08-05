"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { responseMessage } from "../helpers"

export const add_course = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        categoryId: Joi.string().required().error(new Error('categoryId is required!')),
        title: Joi.string().required().error(new Error('title is required!')),
        image: Joi.string().required().error(new Error('image is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.categoryId)) return res.status(400).json(new apiResponse(400, 'invalid categoryId', {}));
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const update_course = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        categoryId: Joi.string().required().error(new Error('categoryId is required!')),
        courseId: Joi.string().required().error(new Error('courseId is required!')),
        title: Joi.string().error(new Error('title is string!')),
        description: Joi.string().error(new Error('description is string!')),
        image: Joi.string().error(new Error('image is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.categoryId)) return res.status(400).json(new apiResponse(400, 'invalid categoryId', {}));
        if (!isValidObjectId(result?.courseId)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('courseId'), {}))
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('id'), {}));
    next()
}