require('dotenv').config()
const mongoose = require('mongoose');
const Contenedor = require("./Contenedores/contenedorSql.js")
const options = require("./connection/options.js")
const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const normalizer = require('normalizr')
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const cluster = require('cluster')
const rutaPrincipal = require('./Routers/RutaPrincipal.js')
const cookieParser = require("cookie-parser")
const compression = require('compression')
const servicio = require('./Servicio/servicio.js')
//MySQL (productos)
const archivo = new Contenedor(options.mysql, "ecommerce")
//Argumentos
const parseArgs = require('minimist')
const argv = parseArgs(process.argv.slice(2))
const mode = argv.mode
//Numeros de CPU
const numCPUs = require('os').cpus().length 
//Puerto
const PORT =  process.env.PORT || 8000

const initMongoDb = async () => {
        const connectAtlas = "mongodb+srv://root:root@cluster0.i61fljc.mongodb.net/ecommerce?retryWrites=true&w=majority"
        const connectLocal = "mongodb://localhost:27017/ecommerce"
        try {
            await mongoose.connect(connectAtlas, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            console.log("servidor iniciado mongodb")
        } catch (error) {
            console.log(error)
        }
}
//MongoDb sesiones
/* const MongoStore = require("connect-mongo")
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true}
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://root:root@cluster0.i61fljc.mongodb.net/sesiones?retryWrites=true&w=majority",
        mongoOptions: advancedOptions,
        ttl: 600
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: false
})) */
app.set('views', './views'); 
app.set('view engine', 'ejs'); 
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))
app.use(cookieParser())
app.use(compression())
app.use('/', rutaPrincipal)

if(mode === 'cluster'){
    if(cluster.isPrimary){
        console.log("Worker master escuchando con " + numCPUs + " procesadores")
        for (let index = 0; index < numCPUs; index++) {
            cluster.fork()
        }
        cluster.on('exit', (worker, code, signal)=>{
            console.log('Worker exit')
        })
    }else{
        httpServer.listen(PORT, async () => {
            await initMongoDb()
            console.log('Server escuchando en modo cluster en puerto ' + PORT)
        }) 
    }
}else{
    httpServer.listen(PORT, async () => {
        await initMongoDb()
        console.log('Server escuchando en modo fork en puerto ' + PORT)
    }) 
}

io.on('connection', async (socket) => { 
    console.log('Usuario conectado')
    const productosMongo = await servicio.obtenerProductos()
    try {
        socket.emit("productos", productosMongo) 
    } catch (error) {
        logger.log('error', error)
    }
    socket.on('producto', async (data) => {
        try {
            await servicio.guardarProductos(data)
        } catch (error) {
            logger.log('error', error)
        }
        io.sockets.emit('productoNuevo', data);
    }); 

    const mensajesMongo = await servicio.obtenerMensajes()

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
    },mensajesSchema)
    socket.emit('mensajes', mensajesNormalizados)

    socket.on('mensaje', async (data) => {
        try {
            await servicio.guardarMensaje(data)
        } catch (error) {
            logger.log('error', error)
        }
        io.sockets.emit('mensajeNuevo', data);
    });
})

