"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { favoriteModel } from '../../database'
import { adminDeleteAction, apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import config from "config";
import getYouTubeID from "get-youtube-id";
import axios from "axios";

import { responseMessage } from '../../helpers'

const ObjectId = mongoose.Types.ObjectId
const google_api_key = config.get("google_api_key");

export const add_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        let existFav = await favoriteModel.findOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId), isActive: true })
        if (existFav != null) {
            await favoriteModel.deleteOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) })
            return res.status(200).json(new apiResponse(200, 'Video unfavorited successfully', {}));
        }
        else {
            await new favoriteModel({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) }).save()
            return res.status(200).json(new apiResponse(200, 'Video favorited successfully', {}));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
    }
}

// export const get_favorite = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = (req.header('user') as any)?._id
//     try {
//         let response = await favoriteModel.aggregate([
//             { $match: { userId: ObjectId(user), isActive: true } },
//             {
//                 $lookup: {
//                     from: "videos",
//                     let: { videoId: '$videoId' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$_id', '$$videoId'] },
//                                         { $eq: ['$isActive', true] },
//                                     ],
//                                 },
//                             }
//                         },
//                         {
//                             $project: {
//                                 title: 1,
//                                 url: 1,
//                                 description: 1,
//                                 isPremium: 1
//                             }
//                         }
//                     ],
//                     as: "video"
//                 }
//             },
//             {
//                 $project: {
//                     video: { $first: "$video" }
//                 }
//             }
//         ])
//         if (response) {
//             let data_response = [];
//             for (let i = 0; i < response.length; i++) {
//                 let video_id = getYouTubeID(response[i]?.video?.url);

//             }

//             return res.status(200).json(new apiResponse(200, 'Favorited video', data_response))
//         }
//         else return res.status(400).json(new apiResponse(400, 'Database error', {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
//     }
// }

// export const delete_favorite = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = (req.header('user') as any)?._id
//     try {
//         let response = await favoriteModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
//         if (response) return res.status(200).json(new apiResponse(200, 'Favorite video deleted', {}))
//         else return res.status(400).json(new apiResponse(400, 'Database error', {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, "Internal Server Error", error))
//     }
// }

// export const get_filter_favorite = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = req.header('user'),
//         { limit, page, ascending } = req.body,
//         skip = 0,
//         response: any = {},
//         sort: any = {}
//     limit = parseInt(limit)
//     skip = ((parseInt(page) - 1) * parseInt(limit))
//     try {
//         sort.createdAt = -1

//         let fav_video = await favoriteModel.aggregate([
//             { $match: { userId: ObjectId((req.header('user') as any)?._id), isActive: true } },
//             {
//                 $lookup: {
//                     from: "videos",
//                     let: { videoId: '$videoId' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$_id', '$$videoId'] },
//                                         { $eq: ['$isActive', true] },
//                                     ],
//                                 },
//                             }
//                         },
//                         {
//                             $project: {
//                                 title: 1,
//                                 url: 1,
//                                 description: 1,
//                                 isPremium: 1
//                             }
//                         }
//                     ],
//                     as: "video"
//                 }
//             },
//             {
//                 $facet: {
//                     video: [
//                         { $unwind: { path: "$video" } },
//                         { $sort: sort },
//                         { $skip: skip },
//                         { $limit: limit },
//                         {
//                             $project: {
//                                 video: { $first: "$video" }
//                             }
//                         }
//                     ],
//                     video_count: [{ $count: "count" }]
//                 }
//             }
//         ]);

//         let data_response = [];
//         for (let i = 0; i < fav_video[0].video.length; i++) {
//             let video_id = getYouTubeID(fav_video[0].video[i]?.video?.url);
//             await axios.get(`${youtube_url}?part=snippet&key=${google_api_key}&id=${video_id}`).then((res) => {
//                 let path = res?.data?.items[0]?.snippet?.thumbnails;
//                 data_response.push({
//                     ...fav_video[0].video[i],
//                     thumbnail: path?.maxres == undefined ? path?.standard?.url : path?.maxres?.url,
//                 });
//             });
//         }

//         response.fav_video = data_response || []
//         response.state = {
//             page, limit,
//             page_limit: Math.ceil(fav_video[0]?.video_count[0]?.count / limit)
//         }
//         res.status(200).json(new apiResponse(200, `Get fav book successfully`, response))
//     } catch (error) {
//         return res.status(500).json(new apiResponse(500, 'Internal Server error', error))
//     }
// }