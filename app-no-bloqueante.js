const express = require('express');
const { fork } = require('child_process');
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('views', './views'); 
app.set('view engine', 'ejs'); 

//Argumentos
const parseArgs = require('minimist')
const argv = parseArgs(process.argv.slice(2))

//Puerto
const PORT =  Number(argv.port) || 8080

app.get("/", (req, res) => {
    res.send({
        Ruta: "/"
    })
})

app.get("/info", (req, res) => {
    res.render("info", {info: [
        {clave: "Argumentos de entrada", valor: process.argv.slice(2)},
        {clave: "Sistema operativo", valor: process.platform},
        {clave: "Version de node", valor: process.version},
        {clave: "Memoria total reservada", valor: process.memoryUsage().rss},
        {clave: "Path de ejecucion", valor: "5"},
        {clave: "Process id", valor: process.pid},
        {clave: "Carpeta del proyecto", valor: process.cwd()},
    ]})
})

app.get("/api/randoms", (req, res) => {

    const cantidadNum = req.query.cant ? req.query.cant : 100000000
    const computo = fork('./scripts/CalcularRandom.js')
    computo.send(cantidadNum)
    computo.on('message',(sum) => {
        console.log(sum) 
        res.json(sum)
    })
    
})

const server = app.listen(PORT, ()=>{
    console.log("Server escuchando en puerto " + PORT)
})