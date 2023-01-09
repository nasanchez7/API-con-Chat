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

//Bcryptjs
const bcrypt = require('bcryptjs')

//Passport
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

//MySQL (productos)
const archivo = new Contenedor(options.mysql, "ecommerce")
//MongoDb schemas
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
const userSchema = {
    email: {type: String, require: true, max: 100},
    password: {type: String, require: true, max: 100}
}

const collectionSchema = new mongoose.Schema(schemaMensajes)
const collections = mongoose.model("mensajes", collectionSchema)
const mensajes = new MongoDb(collections);

const collectionUserSchema = new mongoose.Schema(userSchema)
const collectionUser = mongoose.model("usuarios", collectionUserSchema)
const usuarios = new MongoDb(collectionUser)

//MongoDb sesiones
const cookieParser = require("cookie-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true}

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))
app.use(cookieParser())
/* app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://root:root@cluster0.i61fljc.mongodb.net/sesiones?retryWrites=true&w=majority",
        mongoOptions: advancedOptions,
        ttl: 600
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: false
})) */
app.use(session({
    secret: "secret",
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 600000
    },
    rolling: true,
    resave: true,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//Plantilla ejs
app.set('views', './views'); 
app.set('view engine', 'ejs'); 

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

//Validar contraseña
const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user)
}

const auth = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

passport.use('login', new LocalStrategy(async (username, password, done) => {
        const usuario = await usuarios.getByMail(username)
        if(!usuario){
            return done(null, false)
        }
        if(isValidPassword(usuario.password, password)){
            return done(null, username)
        }else{
            return done(null, false)
        }
    }
))

passport.use('register', new LocalStrategy(async (username, password, done) => {
    const usuario = await usuarios.getByMail(username)
        if(usuario){
            return done(null, false)
        }else{
            const passwordEncrypted = await bcrypt.hash(password, 10)
            const newUser = {
                email: username,
                password: passwordEncrypted
            }
            await usuarios.save(newUser)
            return done(null, newUser.email)
        }
}))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((username, done) => {
    usuarios.getByMail(username).then(usuario => {
        done(null, usuario)
    })
})

app.get('/', auth, (req, res) => {
    res.render('index', {email: req.user.email})
})

app.get('/login', (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    res.render('login', {})
})

app.get('/register', (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    res.render('register', {})
})

app.post('/login', passport.authenticate('login', {failureRedirect: '/failLogin', successRedirect: '/'}))

app.post('/register', passport.authenticate('register', {failureRedirect: '/failRegister', successRedirect: '/login'}))

app.get('/failLogin', (req, res) => {
    return res.render('failLogin', {})
})

app.get('/failRegister', (req, res) => {
    return res.render('failRegister', {})
})

app.get('/logout', (req, res) => {
    const nombre = req.session.user;
    req.session.destroy((err) => {
        if (!err) {
        return res.render('logout', {nombre: nombre})
        }
        res.status(500).send('Ha ocurrido un error durante el logout');
    });
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

