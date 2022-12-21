const Contenedor = require("./contenedores/contenedorSql.js")
const MongoDb = require('./contenedores/contenedorMongoDB.js')
const options = require("./connection/options.js")
const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const faker = require('faker')
const mongoose = require('mongoose')
const normalizer = require('normalizr')
const util = require('util')

faker.locale = "es"

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

//MySQL (productos)
const archivo = new Contenedor(options.mysql, "ecommerce")
//MongoDb (mensajes)
const schemaMensajes = {
    author: {
        email: {type: String, require: true, max: 100},
        nombre: {type: String, require: true, max: 100},
        apellido: {type: String, require: true, max: 100},
        edad: {type: Number, require: true},
        alias: {type: String, require: true, max: 100},
        avatar: {type: String, require: true, max: 100},
        fecha: {type: String, require: true, max: 100}
    },
    text: {type: String, require: true, max: 100},
}
const collectionSchema = new mongoose.Schema(schemaMensajes)
const collections = mongoose.model("mensajes", collectionSchema)
const mensajes = new MongoDb(collections);

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))

const initMongoDB = async () => {
    try {
        const url = "mongodb://localhost:27017/ecommerce"
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("servidor iniciado mongodb")
    } catch (error) {
        console.log(error)
    }
}

const print = (obj) => {
    console.log(util.inspect(obj, false, 12, true))
}

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname})
})

app.get('/api/productos-test', (req, res) => {
    const productosAleatorios = []
    for (let index = 0; index < 5; index++) {
        productosAleatorios.push({
            title: faker.commerce.product(),
            price: faker.finance.amount(),
            thumbnail: faker.image.fashion()
        })
    }
    res.json(productosAleatorios)
})

httpServer.listen(3000, async () => {
    await initMongoDB()
    console.log('SERVER ON')
}) 

io.on('connection', async (socket) => { 
    console.log('Usuario conectado')
    socket.emit("productos", await archivo.getAll())   

    socket.on('producto', async (data) => {
        await archivo.save(data)
        io.sockets.emit('productoNuevo', data);
    }); 

    const mensajesMongo = await mensajes.getAll()

    const authorSchema = new normalizer.schema.Entity("author", {}, {idAttribute: "email"})
    const mensajeSchema = new normalizer.schema.Entity("mensaje", {
        author: authorSchema
    }, {idAttribute: "id"})
    const mensajesSchema = new normalizer.schema.Entity("mensajes", {
        mensajes: [mensajeSchema]
    }, {idAttribute: "id"})

    const mensajesNormalizados = normalizer.normalize({
        id: "mensajes",
        mensajes: mensajesMongo
    }
    , mensajesSchema)
    socket.emit('mensajes', mensajesNormalizados)

    socket.on('mensaje', async (data) => {
        await mensajes.save(data)
        io.sockets.emit('mensajeNuevo', data);
    });
})

