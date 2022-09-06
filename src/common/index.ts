export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    constructor(status: number, message: string, data: any) {
        this.status = status
        this.message = message
        this.data = data
    }
}
export const [cachingTimeOut, commentLimit] = [1800, 2]

export const getArea = (current: { lat: any, long: any }, RadiusInKm: number) => {
    const differenceForLat = RadiusInKm / 111.12
    const curve = Math.abs(Math.cos((2 * Math.PI * parseFloat(current.lat)) / 360.0))
    const differenceForLong = RadiusInKm / (curve * 111.12)
    const minLat = parseFloat(current.lat) - differenceForLat
    const maxLat = parseFloat(current.lat) + differenceForLat
    const minlon = parseFloat(current.long) - differenceForLong
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
}

export const cacheKeyName = {
    getFeedback: (id: any): any => `GET_FEEDBACK_${id}`,
    getHomePage: (id: any): any => `HOME_PAGE_STORE_${id}`,
    viewStore: (id: any): any => `VIEW_STORE_${id}`,
    allCountry: `ALL_COUNTRY`,
    country: (id: any): any => `COUNTRY_${id}`,
    state: (id: any): any => `STATE_${id}`,
}

export const emailTemplates = {
    storeAction: "Store_Action",
    allUser: "ALL_USER",
}

export const loginType = {
    custom: 0,
    google: 1,
    facebook: 2,
    apple: 3
}

export const storeStatus = {
    pending: 'pending',
    approved: 'approved',
    reject: 'reject',
    blocked: 'blocked',
}

export const userStatus = {
    user: 0,
    admin: 1,
    upload: 5,
}

export const adminDeleteAction = {
    category: (name) => {
        return {
            reason: `Admin has been deleted ${name} category.`,
            message: `Please change your store category.`
        }
    }
}

export const commonCacheKey = {
    0: 'LOCATION_RANGE',
}

export const commonStatus = {
    location: 0,
}

export const URL_decode = (url) => {
    let folder_name = [], image_name
    url.split("/").map((value, index, arr) => {
        image_name = url.split("/")[url.split("/").length - 1]
        folder_name = (url.split("/"))
        folder_name.splice(url.split("/").length - 1, 1)
    })
    return [folder_name.join('/'), image_name]
}

export const not_first_one = (a1: Array<any>, a2: Array<any>) => {
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
}

export const file_path = ['profile', 'course', 'episode', 'video', 'explore', 'notification']

export const notification_types = {
    add_notification: async (data: any) => {
        return {
            template: {
                title: `${data.title}`, body: `${data.image} ${data.description}`
            },
            data: {
                type: 0, image: data.image, description: data.description, title: data.title,
            }
        }
    },
}