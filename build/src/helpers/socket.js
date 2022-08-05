"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConnect = void 0;
const onConnect = socket => {
    console.log(`New Socket connected `, socket?.id);
    socket.emit('new_user', { name: "hedjknjk", message: "Hello New User" });
    socket.on('createRoom', ({ senderUserId, receiverUserId }) => {
    });
    socket.on('joinRoom', ({}) => {
    });
};
exports.onConnect = onConnect;
//# sourceMappingURL=socket.js.map