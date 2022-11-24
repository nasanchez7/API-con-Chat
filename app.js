const Contenedor = require("./contenedores/contenedorSql.js")
const Mensajes = require('./contenedores/contenedorSqlite3.js')
const options = require("./connection/options.js")
const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const archivo = new Contenedor(options.mysql, "ecommerce");
const mensajes = new Mensajes(options.sqlite3, "mensajes");

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname})
})

httpServer.listen(3000, () => console.log('SERVER ON')) 

io.on('connection', async (socket) => { 
    console.log('Usuario conectado')
    socket.emit("productos", await archivo.getAll())   

    socket.on('producto', async (data) => {
        await archivo.save(data)
        io.sockets.emit('productoNuevo', data);
    });

    socket.emit('mensajes', await mensajes.getAll())

    socket.on('mensaje', async (data) => {
        await mensajes.save(data)
        io.sockets.emit('mensajeNuevo', data);
    });
})

