const express = require('express');
const { fork } = require('child_process');
const app = express();
const cluster = require('cluster')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('views', './views'); 
app.set('view engine', 'ejs'); 

//Argumentos
const parseArgs = require('minimist')
const argv = parseArgs(process.argv.slice(2))

//Logger winston
const winston = require('winston')

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({level: 'verbose'}),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'warn.log', level: 'warn'})
    ]
})

//Puerto
const PORT =  Number(argv.port) || 8080

//Modo de ejecucion
const mode = argv.mode

//Procesadores
const numCPUs = require('os').cpus().length

if(mode === 'fork' || mode === undefined){
    app.get("/", (req, res) => {
        const infoRuta = {
            ruta: req.route.path,
            metodo: req.route.stack[0].method
        }
        logger.log('info', infoRuta)
        res.send({
            Ruta: "/",
            puerto: PORT
        })
    })
    app.get("/info", (req, res) => {
        const infoRuta = {
            ruta: req.route.path,
            metodo: req.route.stack[0].method
        }
        logger.log('info', infoRuta)
        res.render("info", {info: [
            {clave: "Argumentos de entrada", valor: process.argv.slice(2)},
            {clave: "Sistema operativo", valor: process.platform},
            {clave: "Version de node", valor: process.version},
            {clave: "Memoria total reservada", valor: process.memoryUsage().rss},
            {clave: "Path de ejecucion", valor: "5"},
            {clave: "Process id", valor: process.pid},
            {clave: "Carpeta del proyecto", valor: process.cwd()},
            {clave: "Numero de procesadores", valor: numCPUs}
        ]})
    })
    app.get("/api/randoms", (req, res) => {
        const infoRuta = {
            ruta: req.route.path,
            metodo: req.route.stack[0].method
        }
        logger.log('info', infoRuta)
        const cantidadNum = req.query.cant ? req.query.cant : 100000000
        const computo = fork('./scripts/CalcularRandom.js')
        computo.send(cantidadNum)
        computo.on('message',(sum) => {
            res.json(sum)
        })

    })
    const server = app.listen(PORT, ()=>{
        console.log("Server escuchando en puerto " + PORT)
    })
}
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
        app.get("/", (req, res) => {
            const infoRuta = {
                ruta: req.route.path,
                metodo: req.route.stack[0].method
            }
            logger.log('info', infoRuta)
            res.send({
                Ruta: "/",
                puerto: PORT
            })
        })
        app.get("/info", (req, res) => {
            const infoRuta = {
                ruta: req.route.path,
                metodo: req.route.stack[0].method
            }
            logger.log('info', infoRuta)
            res.render("info", {info: [
                {clave: "Argumentos de entrada", valor: process.argv.slice(2)},
                {clave: "Sistema operativo", valor: process.platform},
                {clave: "Version de node", valor: process.version},
                {clave: "Memoria total reservada", valor: process.memoryUsage().rss},
                {clave: "Path de ejecucion", valor: "5"},
                {clave: "Process id", valor: process.pid},
                {clave: "Carpeta del proyecto", valor: process.cwd()},
                {clave: "Numero de procesadores", valor: numCPUs}
            ]})
        })
        app.get("/api/randoms", (req, res) => {
            const infoRuta = {
                ruta: req.route.path,
                metodo: req.route.stack[0].method
            }
            logger.log('info', infoRuta)
            const cantidadNum = req.query.cant ? req.query.cant : 100000000
            const computo = fork('./scripts/CalcularRandom.js')
            computo.send(cantidadNum)
            computo.on('message',(sum) => {
                res.json(sum)
            })
        })
        const server = app.listen(PORT, ()=>{
            console.log("Worker escuchando en puerto " + PORT + " con pdi: " + process.pid)
        })
    }
}

