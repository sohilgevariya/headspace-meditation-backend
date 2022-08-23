"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { responseMessage } from "../helpers"

export const signUp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().required().error(new Error('email is required!')),
        firstName: Joi.string().trim().required().trim().error(new Error('firstName is required!')),
        lastName: Joi.string().allow("").trim().required().trim().error(new Error('lastName is required!')),
        password: Joi.string().trim().required().trim().error(new Error('password is required!')),
        // userType: Joi.number().error(new Error('userType is number')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().trim().max(50).error(new Error('email is string!')),
        password: Joi.string().trim().trim().max(20).required().error(new Error('password is required!')),
        deviceToken: Joi.string().trim().trim().error(new Error('deviceToken is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const as_guest = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().error(new Error('name is required!')),
        deviceToken: Joi.string().trim().trim().error(new Error('deviceToken is string!'))
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('id'), {}));
    next()
}

export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().error(new Error('email is string! & max length is 50')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().trim().trim().required().error(new Error('id is required!')),
        password: Joi.string().trim().trim().max(20).required().error(new Error('password is required! & max length is 20')),
        otp: Joi.number().required().error(new Error('otp is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}))
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const otp_verification = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        otp: Joi.number().min(100000).max(999999).required().error(new Error('otp is required! & only is 6 digits'))
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const resend_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().error(new Error('email is string! ')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        image: Joi.string().trim().error(new Error('image is string')),
        fullName: Joi.string().trim().allow(null, '').error(new Error('fullName is string')),
        email: Joi.string().trim().allow(null, '').error(new Error('email is string')),
        name: Joi.string().trim().allow(null, '').error(new Error('name is string')),
        phoneNumber: Joi.string().trim().allow(null, '').error(new Error('phoneNumber is string')),
    })
    schema.validateAsync(req.body).then(result => {
        if (result?.fullName) req.body.name = result?.fullName
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}))
    })
}

export const block = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}))
    if (typeof (req.params.isBlock) !== 'boolean') return res.status(400).json(new apiResponse(400, 'after id value is boolean', {}))
    return next()
}

export const change_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        old_password: Joi.string().trim().required().error(new Error('old_password is required! ')),
        new_password: Joi.string().trim().required().error(new Error('new_password is required! ')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const generate_token = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        old_token: Joi.string().trim().required().error(new Error('old_token is required! ')),
        refresh_token: Joi.string().trim().required().error(new Error('refresh_token is required! ')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const set_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        password: Joi.string().trim().required().error(new Error('password is required!')),
        token: Joi.string().trim().required().error(new Error('token is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const admin_user_get_common = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        isBlock: Joi.string().trim().error(new Error('isBlock is string!')),
        userId: Joi.string().trim().error(new Error('userId is string!')),
    })
    schema.validateAsync(req.query).then(result => {
        if (!isValidObjectId(result?.userId)) return res.status(400).json(new apiResponse(400, responseMessage.invalidId('userId'), {}))
        req.query = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const send_email_all_user = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        message: Joi.string().trim().error(new Error('message is string!')),
        subject: Joi.string().trim().error(new Error('subject is string!')),
    })
    schema.validateAsync(req.query).then(result => {
        req.query = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}
