export const onConnect = socket => {
    console.log(`New Socket connected `, socket?.id)
    socket.emit('new_user', { name: "hedjknjk", message: "Hello New User" })

    socket.on('createRoom', ({ senderUserId, receiverUserId }) => {

    })

    socket.on('joinRoom', ({ }) => {
    })
};