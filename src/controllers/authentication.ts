"use strict"
import { reqInfo } from '../helpers/winston_logger'
import { userModel, userSessionModel } from '../database'
import { apiResponse, loginType, URL_decode, userStatus } from '../common'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, Response } from 'express'
import axios from 'axios'
import { responseMessage, deleteImage } from '../helpers'
import async from 'async'
import { forgot_password_mail } from '../helpers/mail'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body;
        let isAlready: any = await userModel.findOne({ email: body.email, isActive: true })
        if (isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}))
        if (isAlready?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}))

        const salt = await bcryptjs.genSaltSync(10);
        const hashPassword = await bcryptjs.hash(body.password, salt);
        delete body.password;
        body.password = hashPassword;
        for (let flag = 0; flag < 1;) {
            var authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        body.authToken = authToken;
        let response = await new userModel(body).save()
        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        await async.parallel([
            (callback) => { new userSessionModel({ createdBy: response._id, refresh_token }).save().then(data => { callback(null, data) }).catch(err => { console.log(err) }) },
        ])
        response = {
            userType: response?.userType,
            loginType: response?.loginType,
            _id: response?._id,
            firstName: response?.firstName,
            lastName: response?.lastName,
            email: response?.email,
            image: response?.image,
            isUserPremium: response?.isUserPremium,
            token,
            refresh_token
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.signupSuccess, response))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const login = async (req: Request, res: Response) => {
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOneAndUpdate({ $and: [{ $or: [{ userType: 0 }, { userType: 1 }] }, { email: body.email, isActive: true }] }, { $addToSet: { deviceToken: body?.deviceToken } }).select('-__v -createdAt -updatedAt')
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}))
        if (response?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}))
        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        await new userSessionModel({
            createdBy: response._id,
            refresh_token
        }).save()
        response = {
            userType: response?.userType,
            loginType: response?.loginType,
            _id: response?._id,
            firstName: response?.firstName,
            lastName: response?.lastName,
            email: response?.email,
            image: response?.image,
            isUserPremium: response?.isUserPremium,
            token,
            refresh_token
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        body.isActive = true
        let data = await userModel.findOne(body)
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}));
        if (data.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
        if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) return res.status(410).json(new apiResponse(410, responseMessage?.expireOTP, {}));
        if (data) return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, { _id: data._id, otp: body.otp }));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0, response: any
    try {
        body.isActive = true
        let data = await userModel.findOne(body).select('email firstName lastName')
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail, {}));
        if (data.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        response = await forgot_password_mail(data, otp).then(result => { return result }).catch(error => { return error })
        if (response) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${response}`, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, `${response}`));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        authToken = 0,
        id = body.id,
        otp = body?.otp
    delete body.otp
    try {
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        body.authToken = authToken
        body.otp = 0
        body.otpExpireTime = null
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, otp: otp }, body, { new: true })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, response))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const resend_otp = async (req: Request, res: Response) => {
    reqInfo(req)
    let { email } = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0,
        response
    try {
        let data = await userModel.findOne({ email, isActive: true })
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage.invalidEmail, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        response = await forgot_password_mail(data, otp)
        if (response) {
            await userModel.findOneAndUpdate({ email, isActive: true }, { otp })
            return res.status(200).json(new apiResponse(200, `${response}`, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage.errorMail, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}))
    }
}

export const change_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { old_password, new_password } = req.body,
        authToken: any
    try {
        let user_data = await userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('password')
        const passwordMatch = await bcryptjs.compare(old_password, user_data.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.oldPasswordError, {}))

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(new_password, salt)
        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(user._id), isActive: true }, { password: hashPassword, authToken }, { new: true })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.passwordChangeSuccess, {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.passwordChangeError, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}

export const generate_token = async (req: Request, res: Response) => {
    let { old_token, refresh_token } = req.body
    reqInfo(req)
    try {
        let isVerifyToken = jwt.verify(old_token, jwt_token_secret)
        let refreshTokenVerify = jwt.verify(refresh_token, refresh_jwt_token_secret)
        if (refreshTokenVerify._id != isVerifyToken._id) return res.status(401).json(new apiResponse(401, responseMessage?.invalidOldTokenReFreshToken, {}))

        let response = await userSessionModel.findOneAndUpdate({ createdBy: ObjectId(isVerifyToken._id), refresh_token, isActive: true }, { isActive: false })
        if (response == null) return res.status(404).json(new apiResponse(404, responseMessage?.refreshTokenNotFound, {}))
        const token = jwt.sign({
            _id: isVerifyToken._id,
            authToken: isVerifyToken.authToken,
            type: isVerifyToken.userType,
            status: "Generate Token",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        refresh_token = jwt.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        await new userSessionModel({
            createdBy: response._id,
            refresh_token
        }).save()
        response = {
            token,
            refresh_token
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.refreshTokenSuccess, response))

    } catch (error) {
        console.log(error.message)
        if (error.message == "invalid signature") return res.status(401).json(new apiResponse(401, responseMessage?.differentToken, {}))
        if (error.message == "jwt malformed") return res.status(401).json(new apiResponse(401, responseMessage?.differentToken, {}))
        if (error.message === "jwt must be provided") return res.status(401).json(new apiResponse(401, responseMessage?.tokenNotFound, {}))
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
    }
}

export const user_logout = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        await userModel.findOneAndUpdate({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, }, { $pull: { deviceToken: req.body?.deviceToken } })
        return res.status(200).json(new apiResponse(200, responseMessage?.logout, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
}

export const google_SL = async (req: Request, res: Response) => {
    let { accessToken, idToken, deviceToken } = req.body
    reqInfo(req)
    try {
        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
                idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

            let access_token: any = await axios.get(verificationAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false;
                })
            let id_token: any = await axios.get(idAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false
                })
            if (access_token.email == id_token.email && access_token.verified_email == true) {
                const isUser = await userModel.findOneAndUpdate({ email: id_token?.email, isActive: true }, { $addToSet: { deviceToken: deviceToken } })
                if (!isUser) {
                    for (let flag = 0; flag < 1;) {
                        var authToken = await Math.round(Math.random() * 1000000)
                        if (authToken.toString().length == 6) {
                            flag++
                        }
                    }
                    return new userModel({
                        email: id_token.email,
                        firstName: id_token.given_name,
                        lastName: id_token.family_name,
                        image: id_token.picture,
                        loginType: loginType.google,
                        deviceToken: [deviceToken],
                        authToken
                    }).save()
                        .then(async response => {

                            const token = jwt.sign({
                                _id: response._id,
                                authToken: response.authToken,
                                type: response.userType,
                                status: "Login",
                                generatedOn: (new Date().getTime())
                            }, jwt_token_secret)

                            const refresh_token = jwt.sign({
                                _id: response._id,
                                generatedOn: (new Date().getTime())
                            }, refresh_jwt_token_secret)

                            await new userSessionModel({
                                createdBy: response._id,
                                refresh_token
                            }).save()

                            let return_response = {
                                userType: response?.userType,
                                loginType: response?.loginType,
                                _id: response?._id,
                                firstName: response?.firstName,
                                lastName: response?.lastName,
                                email: response?.email,
                                isUserPremium: response?.isUserPremium,
                                image: id_token?.picture,
                                token,
                                refresh_token
                            }
                            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response));
                        })
                } else {
                    if (isUser?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
                    const token = jwt.sign({
                        _id: isUser._id,
                        authToken: isUser.authToken,
                        type: isUser.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: isUser._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret)

                    await new userSessionModel({
                        createdBy: isUser._id,
                        refresh_token
                    }).save()

                    let response = {
                        userType: isUser?.userType,
                        loginType: isUser?.loginType,
                        _id: isUser?._id,
                        firstName: isUser?.firstName,
                        lastName: isUser?.lastName,
                        email: isUser?.email,
                        image: isUser?.image,
                        isUserPremium: isUser?.isUserPremium,
                        token,
                        refresh_token
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response));
                }
            }
            return res.status(401).json(new apiResponse(401, responseMessage?.invalidIdTokenAndAccessToken, {}))
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
}

export const facebook_SL = async (req: Request, res: Response) => {
    let { accessToken, deviceToken } = req.body
    reqInfo(req)
    try {
        let userURL = `https://graph.facebook.com/me?fields=first_name,last_name,picture,email&access_token=${accessToken}`
        let user_profile: any = await axios.get(userURL)
            .then((result) => {
                return result.data
            }).catch((error) => {
                return false;
            })
        if (!user_profile) return res.status(200).json(new apiResponse(200, responseMessage?.invalidToken, {}))
        let userIsExist = await userModel.findOneAndUpdate({ $and: [{ $or: [{ facebookId: user_profile?.id }, { email: user_profile?.email, }] }, { isActive: true }] }, { $addToSet: { deviceToken: deviceToken } })
        if (userIsExist) {
            if (userIsExist?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
            const token = jwt.sign({
                _id: userIsExist._id,
                authToken: userIsExist.authToken,
                type: userIsExist.userType,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)

            const refresh_token = jwt.sign({
                _id: userIsExist._id,
                generatedOn: (new Date().getTime())
            }, refresh_jwt_token_secret)

            await new userSessionModel({
                createdBy: userIsExist._id,
                refresh_token
            }).save()
            let response = {
                _id: userIsExist?._id,
                firstName: userIsExist?.firstName,
                lastName: userIsExist?.lastName,
                userType: userIsExist.userType,
                loginType: userIsExist.loginType,
                email: userIsExist?.email,
                image: userIsExist?.image,
                isUserPremium: userIsExist?.isUserPremium,
                token,
                refresh_token
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response));
        } else {
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }

            return new userModel({
                email: user_profile.email,
                firstName: user_profile.first_name,
                lastName: user_profile.last_name,
                loginType: loginType.facebook,
                facebookId: user_profile?.id,
                image: user_profile.picture.data.url,
                deviceToken: [deviceToken],
                authToken
            }).save()
                .then(async response => {
                    const token = jwt.sign({
                        _id: response._id,
                        authToken: response.authToken,
                        type: response.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: response._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret)

                    await new userSessionModel({
                        createdBy: response._id,
                        refresh_token
                    }).save()

                    let return_response = {
                        userType: response.userType,
                        loginType: response.loginType,
                        _id: response?._id,
                        firstName: response?.firstName,
                        lastName: response?.lastName,
                        email: response?.email,
                        isUserPremium: response?.isUserPremium,
                        image: user_profile?.picture?.data.url,
                        token,
                        refresh_token
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response));
                })
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
}

export const Apple_SL = async (req: Request, res: Response) => {
    let { deviceToken, email, lastName, firstName, appleAuthCode, } = req.body, match: any = {}
    reqInfo(req)
    try {
        if (email && appleAuthCode.length != 0) match = { $or: [{ email, }, { appleAuthCode }], isActive: true, }
        if (!email && appleAuthCode.length != 0) match = { isActive: true, appleAuthCode }
        let userExist = await userModel.findOneAndUpdate(match, { $addToSet: { ...(deviceToken) && { deviceToken }, ...(appleAuthCode.length != 0) && { appleAuthCode } } }, { new: true })
        if (!userExist) {
            if (!email) return res.status(400).json(new apiResponse(400, responseMessage?.appleAccountError, {}))
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }
            return new userModel({
                email: email,
                name: "Guest User",
                loginType: loginType.apple,
                deviceToken: [deviceToken],
                authToken,
                appleAuthCode: appleAuthCode
            }).save()
                .then(async response => {

                    const token = jwt.sign({
                        _id: response._id,
                        authToken: response.authToken,
                        type: response.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: response._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret)

                    await new userSessionModel({
                        createdBy: response._id,
                        refresh_token
                    }).save()

                    let return_response = {
                        userType: response?.userType,
                        loginType: response?.loginType,
                        _id: response?._id,
                        firstName: response?.firstName,
                        lastName: response?.lastName,
                        email: response?.email,
                        isUserPremium: response?.isUserPremium,
                        image: null,
                        token,
                        refresh_token
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response));
                })
        } else {
            if (userExist?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
            const token = jwt.sign({
                _id: userExist._id,
                authToken: userExist.authToken,
                type: userExist.userType,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)

            const refresh_token = jwt.sign({
                _id: userExist._id,
                generatedOn: (new Date().getTime())
            }, refresh_jwt_token_secret)

            await new userSessionModel({
                createdBy: userExist._id,
                refresh_token
            }).save()

            let response = {
                userType: userExist?.userType,
                loginType: userExist?.loginType,
                _id: userExist?._id,
                firstName: userExist?.firstName,
                lastName: userExist?.lastName,
                email: userExist?.email,
                image: userExist?.image,
                isUserPremium: userExist?.isUserPremium,
                token,
                refresh_token
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
    }
}

export const update_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id

    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.user }, body)
        if (response) {
            if (body?.image != response?.image && response.image != null && body?.image != null && body?.image != undefined) {
                let [folder_name, image_name] = await URL_decode(response?.image)
                await deleteImage(image_name, folder_name)
            }
            return res.status(200).json(new apiResponse(200, 'Profile updated successfully', {}))
        }
        else return res.status(404).json(new apiResponse(404, 'Database error while updating profile', {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
    }
}

export const get_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'), response: any
    try {
        response = await userModel.findOne({ _id: ObjectId(user._id), isActive: true })
        if (response) return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Your profile'), response))
        else return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('profile'), {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}))
    }
}