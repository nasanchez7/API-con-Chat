const fs = require('fs');

class Contenedor{
    constructor(archivo, id ){
        this.archivo = `./${archivo}.txt`
        this.id = 1
    }

    async save(objeto){
        try{
            if(!fs.existsSync(this.archivo)) {
                await fs.promises.writeFile(this.archivo, JSON.stringify([
                    {
                        id: this.id,
                        ...objeto
                    }
                ]));
                return `Has agregado ${objeto.title} con el id ${this.id}`
            }else{
                const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
                const json = JSON.parse(archivo);
                if(json.length > 0){
                    json.push({
                        id: json.length + 1,
                        ...objeto
                    })
                    await fs.promises.writeFile(this.archivo, JSON.stringify(json))
                    return { msj: `Has agregado ${objeto.title} con el id ${json.length}`}
                }
            }
        }
        catch(e){
            console.log(`Ha habido un error al leer el archivo ${this.archivo}`)
        }
    }

    async getById(id){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                const obj = json.find(obj => obj.id === id)
                if (obj){
                    return obj
                }else{
                    return {error: "producto no encontrado"}
                } 
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getAll(){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                return json
            }
            console.log("Archivo vacio")
        } catch (error) {
            console.log(error)
        }
    }

    async deleteById(id){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                const index = json.findIndex(obj => obj.id === id)
                if (index === -1) {
                    console.log(`El objeto no existe`)
                } else {
                    json.splice(index, 1)
                    await fs.promises.writeFile(this.archivo, JSON.stringify(json))
                }
            }
        }catch(error){
            console.log(error)
        } 
    } 
    async deleteAll(){
        try {
            await fs.promises.writeFile(this.archivo, "[]")
        } catch (error) {
            console.log(error)
        }
    }
}

class Mensajes {
    constructor(archivo){
        this.archivo = `./${archivo}.txt`
    }

    async save(objeto){
        try{
            if(!fs.existsSync(this.archivo)) {
                await fs.promises.writeFile(this.archivo, JSON.stringify([
                    {
                        ...objeto
                    }
                ]));
            }else{
                const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
                const json = JSON.parse(archivo);
                if(json.length > 0){
                    json.push({
                        ...objeto
                    })
                    await fs.promises.writeFile(this.archivo, JSON.stringify(json))
                }
            }
        }
        catch(e){
            console.log(`Ha habido un error al leer el archivo ${this.archivo}`)
        }
    }

    async getAll(){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                return json
            }
            console.log("Archivo vacio")
        } catch (error) {
            console.log(error)
        }
    }
}

const archivo = new Contenedor("productos");
const mensajes = new Mensajes("mensajes");

const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

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

