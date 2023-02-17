const servicio = require('../Servicio/servicio.js')
const winston = require('winston')
const faker = require('faker')
faker.locale = "es"
const sendMsj = async (body) => {
    const twilio = require('twilio')

    const accoundSid = "AC87fb25a349a10a40bd1212f7115056d9"
    const authToken = "21185d9f36ab567f643b2f4566770f88"

    const client = twilio(accoundSid, authToken)

    try {
        const message = await client.messages.create({
            body: `Pedido recibido y en proceso`,
            from: "+19786453894",
            to: body.telefono
        })
    } catch (error) {
        logger.log('warn', error)
    }
}
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
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({level: 'verbose'}),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'warn.log', level: 'warn'})
    ]
})


const getIndex = (req, res) => {
    const infoRuta = {
        ruta: req.route.path,
        metodo: req.route.stack[0].method
    }
    logger.log('info', infoRuta)
    res.render('index', {user: req.user})
}
const getLogin = (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    const infoRuta = {
        ruta: req.route.path,
        metodo: req.route.stack[0].method
    }
    logger.log('info', infoRuta)
    res.render('login', {})
}
const getRegister = (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    const infoRuta = {
        ruta: req.route.path,
        metodo: req.route.stack[0].method
    }
    logger.log('info', infoRuta)
    res.render('register', {})
}
const postPay = async (req, res) => {
    const productosMongoDb = await servicio.obtenerProductos()
    let nombreProductos = ""
    for (let index = 0; index < productosMongoDb.length; index++) {
        nombreProductos = nombreProductos + productosMongoDb[index].title + ", "
    }
    await sendEmail('pay', {
        userInfo: req.user,
        productos: String(nombreProductos)
    })
    await sendMsj(req.user)
    res.redirect("/")
}
const postVaciarCarrito = async (req, res) => {
    await servicio.eliminarProductos()
    res.redirect("/")
}
const postSubirAvatar = async (req, res) => {
    logger.log('info', "avatar subido")
    console.log(req.session.passport.user)
    res.redirect("/")
}
const getFailLogin = async (req, res) => {
    logger.log('warn', 'Logueo fallido')
    return res.render('failLogin', {})
}
const getFailRegister = async (req, res) => {
    logger.log('warn', 'Registro fallido')
    return res.render('failRegister', {})
}
const getLogout = async (req, res) => {
    const nombre = req.session.user;
    const infoRuta = {
        ruta: req.route.path,
        metodo: req.route.stack[0].method
    }
    logger.log('info', infoRuta)
    req.session.destroy((err) => {
        if (!err) {
        return res.render('logout', {nombre: nombre})
        }
        logger.log('warn', 'Ha ocurrido un error durante el logout')
        res.status(500).send('Ha ocurrido un error durante el logout');
    });
}
const getProductosTest = async (req, res) => {
    const productosAleatorios = []
    for (let index = 0; index < 5; index++) {
        productosAleatorios.push({
            title: faker.commerce.product(),
            price: faker.finance.amount(),
            thumbnail: faker.image.fashion()
        })
    }
    const infoRuta = {
        ruta: req.route.path,
        metodo: req.route.stack[0].method
    }
    logger.log('info', infoRuta)
    res.json(productosAleatorios)
}
const auth = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}


module.exports = {getIndex, getLogin, getRegister, postPay, postVaciarCarrito,
    postSubirAvatar, getFailLogin, getFailRegister, getLogout, getProductosTest, auth
}