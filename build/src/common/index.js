"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationTemplate = exports.reactionValue = exports.reactionArray = exports.file_path = exports.not_first_one = exports.URL_decode = exports.commonStatus = exports.commonCacheKey = exports.adminDeleteAction = exports.userStatus = exports.storeStatus = exports.loginType = exports.emailTemplates = exports.cacheKeyName = exports.getArea = exports.commentLimit = exports.cachingTimeOut = exports.apiResponse = void 0;
class apiResponse {
    constructor(status, message, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.apiResponse = apiResponse;
_a = [1800, 2], exports.cachingTimeOut = _a[0], exports.commentLimit = _a[1];
const getArea = (current, RadiusInKm) => {
    const differenceForLat = RadiusInKm / 111.12;
    const curve = Math.abs(Math.cos((2 * Math.PI * parseFloat(current.lat)) / 360.0));
    const differenceForLong = RadiusInKm / (curve * 111.12);
    const minLat = parseFloat(current.lat) - differenceForLat;
    const maxLat = parseFloat(current.lat) + differenceForLat;
    const minlon = parseFloat(current.long) - differenceForLong;
    const maxlon = parseFloat(current.long) + differenceForLong;
    return {
        min: {
            lat: minLat,
            long: minlon,
        },
        max: {
            lat: maxLat,
            long: maxlon,
        },
    };
};
exports.getArea = getArea;
exports.cacheKeyName = {
    getFeedback: (id) => `GET_FEEDBACK_${id}`,
    getHomePage: (id) => `HOME_PAGE_STORE_${id}`,
    viewStore: (id) => `VIEW_STORE_${id}`,
    allCountry: `ALL_COUNTRY`,
    country: (id) => `COUNTRY_${id}`,
    state: (id) => `STATE_${id}`,
};
exports.emailTemplates = {
    storeAction: "Store_Action",
    allUser: "ALL_USER",
};
exports.loginType = {
    custom: 0,
    google: 1,
    facebook: 2,
    apple: 3
};
exports.storeStatus = {
    pending: 'pending',
    approved: 'approved',
    reject: 'reject',
    blocked: 'blocked',
};
exports.userStatus = {
    user: 0,
    admin: 1,
    upload: 5,
};
exports.adminDeleteAction = {
    category: (name) => {
        return {
            reason: `Admin has been deleted ${name} category.`,
            message: `Please change your store category.`
        };
    }
};
exports.commonCacheKey = {
    0: 'LOCATION_RANGE',
};
exports.commonStatus = {
    location: 0,
};
const URL_decode = (url) => {
    let folder_name = [], image_name;
    url.split("/").map((value, index, arr) => {
        image_name = url.split("/")[url.split("/").length - 1];
        folder_name = (url.split("/"));
        folder_name.splice(url.split("/").length - 1, 1);
    });
    return [folder_name.join('/'), image_name];
};
exports.URL_decode = URL_decode;
const not_first_one = (a1, a2) => {
    var a = [], diff = [];
    for (var i = 0; i < a1?.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2?.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
};
exports.not_first_one = not_first_one;
exports.file_path = ['profile', 'course', 'episode', 'video', 'explore'];
exports.reactionArray = ['smile', 'sad', 'angry', 'heart'];
exports.reactionValue = { heart: 4, smile: 3, sad: 2, angry: 1 };
exports.notificationTemplate = {
    comment: (data) => {
        return {
            template: {
                title: `New comment`, body: `${data?.fullName} commented on your review`
            },
            data: {
                type: 0, reviewId: data?.reviewId, storeId: data?.storeId, commentId: data?.commentId, click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    },
    store_comment: (data) => {
        return {
            template: {
                title: `New comment`, body: `${data?.fullName} commented on your store review`
            },
            data: {
                type: 0, reviewId: data?.reviewId, storeId: data?.storeId, commentId: data?.commentId, click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    },
    review: (data) => {
        return {
            template: {
                title: `New Review`, body: `${data?.fullName} reviewed on your store`
            },
            data: {
                type: 1, reviewId: data?.reviewId, storeId: data?.storeId, click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    },
};
//# sourceMappingURL=index.js.map