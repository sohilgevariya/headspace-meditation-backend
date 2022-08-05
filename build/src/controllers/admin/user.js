"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_premium = exports.user_block = exports.get_user_by_id = exports.get_user_pagination = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const helpers_1 = require("../../helpers");
const ObjectId = require('mongoose').Types.ObjectId;
const get_user_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response, { isBlock, page, limit, search } = req.body, match = {};
    try {
        // if (search) {
        //     var usernameArray: Array<any> = []
        //     var emailArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         usernameArray.push({ fullName: { $regex: data, $options: 'si' } })
        //         emailArray.push({ email: { $regex: data, $options: 'si' } })
        //     })
        //     match.$or = [{ $and: usernameArray }, { $and: emailArray }]
        // }
        match.isActive = true;
        // match = { ...(isBlock != undefined) && { isBlock }, ...match }
        match.userType = common_1.userStatus.user;
        response = await database_1.userModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        { $project: { firstName: 1, lastName: 1, image: 1, email: 1, isUserPremium: 1, isActive: 1, isBlock: 1, loginType: 1, createdAt: 1 } },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('user'), {
            user_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit)) || 1
            }
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_user_pagination = get_user_pagination;
const get_user_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response, { id } = req.params;
    try {
        response = await database_1.userModel.findOne({ _id: ObjectId(id), isActive: true, userType: common_1.userStatus.user }, { createdAt: 0, updatedAt: 0, deviceToken: 0, authToken: 0, __v: 0, password: 0 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('user'), response));
        else
            return res.status(404).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataNotFound('user'), {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_user_by_id = get_user_by_id;
const user_block = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), body = req.body, response;
    try {
        response = await database_1.userModel.findOneAndUpdate({ _id: ObjectId(body?.userId), isActive: true }, { isBlock: body?.isBlock }, { new: true }).select('firstName lastName image email isActive isBlock');
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, "User successfully blocked!", response));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('User'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.user_block = user_block;
const user_premium = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), body = req.body, response;
    try {
        response = await database_1.userModel.findOneAndUpdate({ _id: ObjectId(body?.userId), isActive: true }, { isUserPremium: true }, { new: true }).select('name image isUserPremium email userType loginType isBlock');
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, "success!", response));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, helpers_1.responseMessage?.updateDataError('User'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.user_premium = user_premium;
//# sourceMappingURL=user.js.map