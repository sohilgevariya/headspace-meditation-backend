"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAccess = exports.partial_userJWT = exports.userJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const database_1 = require("../database");
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../common");
const _1 = require(".");
const ObjectId = mongoose_1.default.Types.ObjectId;
const jwt_token_secret = config_1.default.get('jwt_token_secret');
const userJWT = async (req, res, next) => {
    let { authorization } = req.headers, result;
    if (authorization) {
        try {
            let isVerifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            // if (parseInt(isVerifyToken.type) != 0 || parseInt(isVerifyToken.type) != 1 ){
            //     return res.status(401).json(new apiResponse(401, responseMessage.accessDenied, {}));  
            // } 
            result = await database_1.userModel.findOne({ _id: ObjectId(isVerifyToken?._id), isActive: true });
            // if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
            if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.invalidToken, {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature")
                return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.differentToken, {}));
            console.log(err);
            return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.invalidToken, {}));
        }
    }
    else {
        return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.tokenNotFound, {}));
    }
};
exports.userJWT = userJWT;
const partial_userJWT = async (req, res, next) => {
    let { authorization, userType } = req.headers, result;
    if (!authorization) {
        next();
    }
    else {
        try {
            let isVerifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            if (isVerifyToken?.type != userType && userType != "5")
                return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.accessDenied, {}));
            result = await database_1.userModel.findOne({ _id: ObjectId(isVerifyToken?._id), isActive: true });
            if (result?.isActive == true && isVerifyToken?.authToken == result?.authToken && isVerifyToken?.type == result?.userType) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, _1.responseMessage.invalidToken, {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature")
                return res.status(401).json(new common_1.apiResponse(401, `Don't try different one token`, {}));
            if (err.message === "jwt must be provided")
                return res.status(401).json(new common_1.apiResponse(401, `Token not found in header`, {}));
            console.log(err);
            return res.status(401).json(new common_1.apiResponse(401, "Invalid Token", {}));
        }
    }
};
exports.partial_userJWT = partial_userJWT;
const adminAccess = async (req, res, next) => {
    try {
        let admin = req.header('user');
        if (admin.type != 1)
            return res.status(401).json(new common_1.apiResponse(401, "Access denied", {}));
        next();
    }
    catch (err) {
        if (err.message == "invalid signature")
            return res.status(401).json(new common_1.apiResponse(401, `Don't try different one token`, {}));
        console.log(err);
        return res.status(500).json(new common_1.apiResponse(500, "Admin access internal server error", {}));
    }
};
exports.adminAccess = adminAccess;
//# sourceMappingURL=jwt.js.map