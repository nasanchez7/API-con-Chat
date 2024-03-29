require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const normalizer = require('normalizr')
const graphQlExpress = require('express-graphql')
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const cluster = require('cluster')
const rutaPrincipal = require('./Routers/RutaPrincipal.js')
const cookieParser = require("cookie-parser")
const compression = require('compression')
const servicio = require('./Servicio/servicio.js')

//Argumentos
const parseArgs = require('minimist');
const argv = parseArgs(process.argv.slice(2))
const { schemaProducto, obtenerProductos, eliminarProductos } = require('./controllers/controllersGraphQl.js');

//Modo de ejecucion (fork o cluster)
const mode = argv.mode
//Numeros de CPU
const numCPUs = require('os').cpus().length 
//Puerto
const PORT = process.env.PORT || 8000

const initMongoDb = async () => {
        const connectAtlas = process.env.MONGODB_URL_ATLAS
        const connectLocal = process.env.MONGODB_URL
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
app.set('views', './views'); 
app.set('view engine', 'ejs'); 
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))
app.use(cookieParser())
app.use(compression())
app.use('/', rutaPrincipal)
app.use('/graphql', graphQlExpress.graphqlHTTP({
    schema: schemaProducto,
    rootValue: {
        eliminarProductos,
        obtenerProductos
    },
    graphiql: true
})) 


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


//Coneccion a socket
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

