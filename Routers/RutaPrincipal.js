const express = require('express');
const session = require("express-session")
const servicio = require('../Servicio/servicio.js')
const controllers = require('../controllers/controllers.js');
//Multer y passports
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public')
    },
    filename: (req, file, cb) => {
        cb(null, `${req.session.passport.user}.jpg`)
    }
})
const upload = multer({storage: storage})
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const rutaPrincipal = new express.Router()
rutaPrincipal.use(session({
    secret: "secret",
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 6000000
    },
    rolling: true,
    resave: true,
    saveUninitialized: false
})) 
rutaPrincipal.use(passport.initialize())
rutaPrincipal.use(passport.session())

const sendEmail = async (type, body) => {
    const emailAdmin = "delia95@ethereal.email"
    const nodeMailer = require('nodemailer')
    const transporter = nodeMailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'delia95@ethereal.email',
                pass: '5GqAq1ZCqtTpPjq6jg'
            }
    })
    if(type === "register"){
        const emailOptions = {
            from: 'Servidor Node.js',
            to: emailAdmin,
            subject: "Usuario nuevo registrado",
            html: `<div>
            <h1>Nueva usuario registrado - Nombre usuario: ${body.nombre} - Email usuario: ${body.email}</h1>
        </div>`
        }
        await transporter.sendMail(emailOptions)
    }else if(type === "pay"){
        const emailOptions = {
            from: 'Servidor Node.js',
            to: emailAdmin,
            subject: "Nueva compra",
            html: `<div>
                <h1>Nueva compra realizada de ${body.userInfo.nombre} - ${body.userInfo.email}</h1>
                <p>Los productos comprados son: ${body.productos}</p>
            </div>`
        }
        await transporter.sendMail(emailOptions)
    }
}
const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user)
}
passport.use('login', new LocalStrategy(async (username, password, done) => {
        const usuario = await servicio.obtenerUsuario(username)
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
passport.use('register', new LocalStrategy({
    passReqToCallback : true
},  async (req, username, password, done) => {
    const usuario = await servicio.obtenerUsuario(username)
        if(usuario){
            return done(null, false)
        }else{
            const passwordEncrypted = await bcrypt.hash(password, 10)
            const newUser = {
                email: username,
                password: passwordEncrypted,
                nombre: req.body.nombre,
                direccion: req.body.direccion,
                edad: req.body.edad,
                telefono: req.body.telefono
            }
            await sendEmail("register", req.body)
            await servicio.guardarUsuario(newUser)
            return done(null, newUser.email)
        }
}))
passport.serializeUser((user, done) => {
    done(null, user)
})
passport.deserializeUser((username, done) => {
    servicio.obtenerUsuario(username).then(usuario => {
        done(null, usuario)
    })
})

rutaPrincipal.get('/', controllers.auth, controllers.getIndex)
rutaPrincipal.get('/login', controllers.getLogin)
rutaPrincipal.get('/register', controllers.getRegister)
rutaPrincipal.post('/pay', controllers.postPay)
//rutaPrincipal.get('/productos', controllers.getProductos)
rutaPrincipal.post('/producto', controllers.saveProducto)
//rutaPrincipal.post('/vaciarCarrito', controllers.postVaciarCarrito)
rutaPrincipal.post('/uploadAvatar', upload.single('avatar'), controllers.postSubirAvatar)
rutaPrincipal.get('/failLogin', controllers.getFailLogin)
rutaPrincipal.get('/failRegister', controllers.getFailRegister)
rutaPrincipal.get('/logout', controllers.getLogout)
rutaPrincipal.get('/api/productos-test', controllers.getProductosTest)
rutaPrincipal.post('/login', passport.authenticate('login', {failureRedirect: '/failLogin', successRedirect: '/'}))
rutaPrincipal.post('/register', passport.authenticate('register', {failureRedirect: '/failRegister', successRedirect: '/login'}))

module.exports = rutaPrincipal