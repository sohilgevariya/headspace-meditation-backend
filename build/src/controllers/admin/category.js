"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_category = exports.get_category = exports.category_by_id = exports.update_category = exports.add_category = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_category = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.name}$`, "ig");
    let user = req.header('user');
    try {
        let isExist = await database_1.categoryModel.findOne({ name: { $regex: search }, isActive: true });
        if (isExist) {
            return res.status(409).json(new common_1.apiResponse(409, helpers_1.responseMessage?.dataAlreadyExist('category'), {}));
        }
        let response = await new database_1.categoryModel(body).save();
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.addDataSuccess('category'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.addDataError, `${response}`));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_category = add_category;
const update_category = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, categoryId = body?.categoryId, user = req.header('user');
    try {
        delete body?.categoryId;
        let response = await database_1.categoryModel.findOneAndUpdate({ _id: ObjectId(categoryId), isActive: true }, body);
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess('category'), {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('category'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.update_category = update_category;
const category_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.categoryModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1 });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('category'), response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('category'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.category_by_id = category_by_id;
const get_category = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.categoryModel.find({ isActive: true }, { name: 1 }).sort({ createdAt: -1 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('category'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('category'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_category = get_category;
const delete_category = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        let response = await database_1.categoryModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            await database_1.categoryModel.findOneAndDelete({ categoryId: ObjectId(id), isActive: true });
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.deleteDataSuccess('category'), response));
        }
        else {
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('category'), {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.delete_category = delete_category;
//# sourceMappingURL=category.js.map