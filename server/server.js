const mongoose = require('mongoose');
const Document = require('./Document.js');

mongoose.connect('mongodb://localhost/google-docs-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

const defaultValue = "";

io.on("connection", socket => {
    socket.on('get-document', async documentId => {
        const document = await findOrCreateDocument(documentId);
        // creates a room where user can edit
        socket.join(documentId);
        socket.emit('load-document', document.data);
        // send changes to specific room when broadcasted
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        // saves/updates the data
        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })

    console.log("Connected")
})

async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);

    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue })
}