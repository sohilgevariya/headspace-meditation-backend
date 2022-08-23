"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { courseModel } from "../../database";
import {
  adminDeleteAction,
  apiResponse,
  emailTemplates,
  storeStatus,
  URL_decode,
} from "../../common";
import { Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import getYouTubeID from "get-youtube-id";
import { deleteImage } from "../../helpers/S3";
import { responseMessage } from "../../helpers";
import axios from "axios";
import c from "config";

const ObjectId = mongoose.Types.ObjectId;
const google_api_key = config.get("google_api_key");

export const course_by_id_detail = async (req: Request, res: Response) => {
  reqInfo(req);
  let { id } = req.params;
  let user: any = req.header("user");
  try {
    let response = await courseModel.aggregate([
      { $match: { _id: ObjectId(id), isActive: true } },
      {
        $lookup: {
          from: "favorites",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$courseId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "favoriteBy",
        },
      },
      {
        $project: {
          title: 1,
          image: 1,
          description: 1,
          // isPremium: 1,
          isFavorite: {
            $cond: {
              if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);
    if (response) {
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            responseMessage?.getDataSuccess("course"),
            response
          )
        );
    } else
      return res
        .status(400)
        .json(
          new apiResponse(400, responseMessage?.getDataNotFound("course"), {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage?.internalServerError, error));
  }
};

export const get_all_course = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user");
  try {
    let response = await courseModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "favorites",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$courseId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "favoriteBy",
        },
      },
      {
        $project: {
          title: 1,
          image: 1,
          description: 1,
          // isPremium: 1,
          isFavorite: {
            $cond: {
              if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
              then: true,
              else: false,
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    if (response) {
      return res
        .status(200)
        .json(
          new apiResponse(200, responseMessage?.getDataSuccess("course"), response)
        );
    } else
      return res
        .status(400)
        .json(
          new apiResponse(400, responseMessage?.getDataNotFound("course"), {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage?.internalServerError, error));
  }
};

export const get_all_course_pagination = async (
  req: Request,
  res: Response
) => {
  reqInfo(req);
  let user: any = req.header("user");
  let response: any,
    { page, limit, search } = req.body,
    match: any = {};
  try {
    // if (search) {
    //     var titleArray: Array<any> = []
    //     search = search.split(" ")
    //     search.forEach(data => {
    //         titleArray.push({ title: { $regex: data, $options: 'si' } })
    //     })
    //     match.$or = [{ $and: titleArray }]
    // }
    match.isActive = true;
    response = await courseModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "favorites",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$courseId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "favoriteBy",
        },
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (((page as number) - 1) * limit) as number },
            { $limit: limit as number },
            {
              $project: {
                title: 1,
                image: 1,
                description: 1,
                // isPremium: 1,
                isActive: 1,
                createdAt: 1,
                isFavorite: {
                  $cond: {
                    if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ],
          data_count: [{ $count: "count" }],
        },
      },
    ]);
    return res.status(200).json(
      new apiResponse(200, responseMessage?.getDataSuccess("course"), {
        course_data: response[0]?.data,
        state: {
          page: req.body?.page,
          limit: req.body?.limit,
          page_limit:
            Math.ceil(
              (response[0]?.data_count[0]?.count / req.body?.limit) as number
            ) || 1,
        },
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage?.internalServerError, {}));
  }
};

export const get_category_wise_course = async (req: Request, res: Response) => {
  reqInfo(req);
  let { page, limit, search, categoryId } = req.body
  let user: any = req.header("user");
  try {
    // let response: any = await courseModel.find({ categoryId: ObjectId(req.params.id), isActive: true })
    let response: any = await courseModel.aggregate([
      { $match: { categoryId: ObjectId(categoryId), isActive: true } },
      {
        $lookup: {
          from: "favorites",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseId", "$$courseId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "favoriteBy",
        },
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (((page as number) - 1) * limit) as number },
            { $limit: limit as number },
            {
              $project: {
                title: 1,
                image: 1,
                description: 1,
                // isPremium: 1,
                isActive: 1,
                createdAt: 1,
                isFavorite: {
                  $cond: {
                    if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ],
          data_count: [{ $count: "count" }],
        },
      },
    ])
    return res.status(200).json(
      new apiResponse(200, responseMessage?.getDataSuccess("course"), {
        course_data: response[0]?.data,
        state: {
          page: req.body?.page,
          limit: req.body?.limit,
          page_limit:
            Math.ceil(
              (response[0]?.data_count[0]?.count / req.body?.limit) as number
            ) || 1,
        },
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage?.internalServerError, {}));
  }
};