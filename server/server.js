const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

io.on("connection", socket => {
    socket.on('get-document', documentId => {
        const data = "";
        // creates a room where user can edit
        socket.join(documentId);
        socket.emit('load-document', data);
        // send changes to specific room when broadcasted
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })
    })

    console.log("Connected")
})