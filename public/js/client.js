var socket = io()

socket.on("new image", (data)=>{
    data = JSON.parse(data)
    console.log(data)
})