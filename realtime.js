module.exports = (server, sessionMiddleware)=>{
    var io = require('socket.io')(server)
    var redis = require('redis')

    // REDIS
    var client  = redis.createClient(7001);
    client.subscribe('images')

    client.on("message", (channel, message)=>{
        console.log('Recibimos un mensaje del canal: '+channel)
        console.log(message)

        if(channel == 'images'){
            io.emit("new image", message)
        }
    })

    io.use((socket, next)=>{
        sessionMiddleware(socket.request, socket.request.res, next)
    })

    io.sockets.on('connection', (socket)=>{
        console.log(socket.request.session.user_id)
    })
}