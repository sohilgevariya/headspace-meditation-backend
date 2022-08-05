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
exports.by_id = exports.update_course = exports.add_course = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const mongoose_1 = require("mongoose");
const helpers_1 = require("../helpers");
const add_course = async (req, res, next) => {
    const schema = Joi.object({
        categoryId: Joi.string().required().error(new Error('categoryId is required!')),
        title: Joi.string().required().error(new Error('title is required!')),
        image: Joi.string().required().error(new Error('image is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result.categoryId))
            return res.status(400).json(new common_1.apiResponse(400, 'invalid categoryId', {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.add_course = add_course;
const update_course = async (req, res, next) => {
    const schema = Joi.object({
        categoryId: Joi.string().required().error(new Error('categoryId is required!')),
        courseId: Joi.string().required().error(new Error('courseId is required!')),
        title: Joi.string().error(new Error('title is string!')),
        description: Joi.string().error(new Error('description is string!')),
        image: Joi.string().error(new Error('image is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result.categoryId))
            return res.status(400).json(new common_1.apiResponse(400, 'invalid categoryId', {}));
        if (!(0, mongoose_1.isValidObjectId)(result?.courseId))
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('courseId'), {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.update_course = update_course;
const by_id = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('id'), {}));
    next();
};
exports.by_id = by_id;
//# sourceMappingURL=course.js.map