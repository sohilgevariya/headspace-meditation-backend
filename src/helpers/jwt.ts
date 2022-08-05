import jwt from 'jsonwebtoken'
import config from 'config'
import { getUser, userModel } from '../database'
import mongoose from 'mongoose'
import { apiResponse  } from '../common'
import { Request, Response } from 'express'
import { responseMessage } from '.'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            
            // if (parseInt(isVerifyToken.type) != 0 || parseInt(isVerifyToken.type) != 1 ){
            //     return res.status(401).json(new apiResponse(401, responseMessage.accessDenied, {}));  
            // } 
            result = await userModel.findOne({ _id: ObjectId(isVerifyToken?._id), isActive: true })
            // if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
            if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(401).json(new apiResponse(401, responseMessage.differentToken, {}))
            console.log(err)
            return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, responseMessage.tokenNotFound, {}))
    }
}

export const partial_userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (!authorization) {
        next()
    } else {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            if (isVerifyToken?.type != userType && userType != "5") return res.status(401).json(new apiResponse(401, responseMessage.accessDenied, {}));
            result = await userModel.findOne({ _id: ObjectId(isVerifyToken?._id), isActive: true })

            if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(401).json(new apiResponse(401, `Don't try different one token`, {}))
            if (err.message === "jwt must be provided") return res.status(401).json(new apiResponse(401, `Token not found in header`, {}))

            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}))
        }
    }
}

export const adminAccess = async (req: Request, res: Response, next) => {
    try {
        let admin: any = req.header('user')
        if (admin.type != 1) return res.status(401).json(new apiResponse(401, "Access denied", {}))
        next()
    } catch (err) {
        if (err.message == "invalid signature") return res.status(401).json(new apiResponse(401, `Don't try different one token`, {}))
        console.log(err)
        return res.status(500).json(new apiResponse(500, "Admin access internal server error", {}))
    }
}