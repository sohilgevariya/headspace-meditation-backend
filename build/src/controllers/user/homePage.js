"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const dashboard = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user');
    try {
        let getEpisodeData = await database_1.episodeModel.aggregate([
            { $match: { isActive: true } },
            {
                $facet: {
                    startYourDay: [
                        { $match: { isMorning: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ],
                    // morning: [
                    //     { $match: { isMorning: 1, isActive: true } },
                    //     { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    // ],
                    afternoonLift: [
                        { $match: { isAfternoon: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ],
                    atNight: [
                        { $match: { isNight: 1, isActive: true } },
                        { $project: { title: 1, image: 1, description: 1, audioOrVideo: 1 } }
                    ]
                }
            }
        ]);
        return res.status(200).json(new common_1.apiResponse(200, `Get user dashboard successfully`, getEpisodeData));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.dashboard = dashboard;
//# sourceMappingURL=homePage.js.map