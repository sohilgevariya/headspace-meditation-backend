"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification_to_multiple_user = exports.notification_to_user = void 0;
const node_gcm_1 = __importDefault(require("node-gcm"));
const config_1 = __importDefault(require("config"));
const sender = new node_gcm_1.default.Sender(config_1.default.get('fcmKey'));
const notification_to_user = async (sender_user_data, data, notification) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sender_user_data && data && notification && sender_user_data?.deviceToken?.length != 0 && sender_user_data != undefined && sender_user_data != null) {
                let message = new node_gcm_1.default.Message({
                    data: data,
                    notification: notification
                });
                // console.log(sender_user_data?.deviceToken);
                sender.send(message, {
                    registrationTokens: sender_user_data?.deviceToken
                }, function (err, response) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(response);
                    }
                });
            }
            else {
                resolve(true);
            }
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.notification_to_user = notification_to_user;
const notification_to_multiple_user = async (multiple_user_data, data, notification) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (multiple_user_data && data && notification) {
                let deviceToken = [];
                multiple_user_data.map(data => {
                    deviceToken.push(...data?.deviceToken);
                });
                if (deviceToken.length != 0) {
                    let message = new node_gcm_1.default.Message({
                        data: data,
                        notification: notification
                    });
                    // console.log(deviceToken);
                    sender.send(message, {
                        registrationTokens: deviceToken
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(response);
                            // console.log(response);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            }
            else {
                resolve(true);
            }
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.notification_to_multiple_user = notification_to_multiple_user;
//# sourceMappingURL=notification.js.map