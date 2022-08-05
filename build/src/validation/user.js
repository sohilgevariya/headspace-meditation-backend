"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_email_all_user = exports.admin_user_get_common = exports.set_password = exports.generate_token = exports.change_password = exports.block = exports.update_profile = exports.resend_otp = exports.otp_verification = exports.reset_password = exports.forgot_password = exports.by_id = exports.as_guest = exports.login = exports.signUp = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const mongoose_1 = require("mongoose");
const helpers_1 = require("../helpers");
const signUp = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().required().error(new Error('email is required!')),
        firstName: Joi.string().trim().required().trim().error(new Error('firstName is required!')),
        lastName: Joi.string().allow("").trim().required().trim().error(new Error('lastName is required!')),
        password: Joi.string().trim().required().trim().error(new Error('password is required!')),
        // userType: Joi.number().error(new Error('userType is number')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.signUp = signUp;
const login = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().trim().max(50).error(new Error('email is string!')),
        password: Joi.string().trim().trim().max(20).required().error(new Error('password is required!')),
        deviceToken: Joi.string().trim().trim().error(new Error('deviceToken is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.login = login;
const as_guest = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().error(new Error('name is required!')),
        deviceToken: Joi.string().trim().trim().error(new Error('deviceToken is string!'))
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.as_guest = as_guest;
const by_id = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('id'), {}));
    next();
};
exports.by_id = by_id;
const forgot_password = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().trim().max(50).error(new Error('email is string! & max length is 50')),
        phoneNumber: Joi.string().trim().trim().error(new Error('phoneNumber is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.forgot_password = forgot_password;
const reset_password = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().trim().trim().required().error(new Error('id is required!')),
        password: Joi.string().trim().trim().max(20).required().error(new Error('password is required! & max length is 20')),
        otp: Joi.number().required().error(new Error('otp is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result.id))
            return res.status(400).json(new common_1.apiResponse(400, 'invalid id', {}));
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.reset_password = reset_password;
const otp_verification = async (req, res, next) => {
    const schema = Joi.object({
        otp: Joi.number().min(100000).max(999999).required().error(new Error('otp is required! & only is 6 digits'))
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.otp_verification = otp_verification;
const resend_otp = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().error(new Error('email is string! ')),
        phoneNumber: Joi.string().trim().error(new Error('phoneNumber is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.resend_otp = resend_otp;
const update_profile = async (req, res, next) => {
    const schema = Joi.object({
        image: Joi.string().trim().error(new Error('image is string')),
        fullName: Joi.string().trim().allow(null, '').error(new Error('fullName is string')),
        email: Joi.string().trim().allow(null, '').error(new Error('email is string')),
        name: Joi.string().trim().allow(null, '').error(new Error('name is string')),
        phoneNumber: Joi.string().trim().allow(null, '').error(new Error('phoneNumber is string')),
    });
    schema.validateAsync(req.body).then(result => {
        if (result?.fullName)
            req.body.name = result?.fullName;
        req.body = result;
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.update_profile = update_profile;
const block = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, 'invalid id', {}));
    if (typeof (req.params.isBlock) !== 'boolean')
        return res.status(400).json(new common_1.apiResponse(400, 'after id value is boolean', {}));
    return next();
};
exports.block = block;
const change_password = async (req, res, next) => {
    const schema = Joi.object({
        old_password: Joi.string().trim().required().error(new Error('old_password is required! ')),
        new_password: Joi.string().trim().required().error(new Error('new_password is required! ')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.change_password = change_password;
const generate_token = async (req, res, next) => {
    const schema = Joi.object({
        old_token: Joi.string().trim().required().error(new Error('old_token is required! ')),
        refresh_token: Joi.string().trim().required().error(new Error('refresh_token is required! ')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.generate_token = generate_token;
const set_password = async (req, res, next) => {
    const schema = Joi.object({
        password: Joi.string().trim().required().error(new Error('password is required!')),
        token: Joi.string().trim().required().error(new Error('token is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.set_password = set_password;
const admin_user_get_common = async (req, res, next) => {
    const schema = Joi.object({
        isBlock: Joi.string().trim().error(new Error('isBlock is string!')),
        userId: Joi.string().trim().error(new Error('userId is string!')),
    });
    schema.validateAsync(req.query).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result?.userId))
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('userId'), {}));
        req.query = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.admin_user_get_common = admin_user_get_common;
const send_email_all_user = async (req, res, next) => {
    const schema = Joi.object({
        message: Joi.string().trim().error(new Error('message is string!')),
        subject: Joi.string().trim().error(new Error('subject is string!')),
    });
    schema.validateAsync(req.query).then(result => {
        req.query = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.send_email_all_user = send_email_all_user;
//# sourceMappingURL=user.js.map