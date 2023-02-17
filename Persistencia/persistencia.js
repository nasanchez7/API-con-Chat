const MongoDb = require('../Contenedores/contenedorMongoDb.js')
const mongoose = require('mongoose')

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
    password: {type: String, require: true, max: 100},
    nombre: {type: String, require: true, max: 100},
    direccion: {type: String, require: true, max: 100},
    edad: {type: Number, require: true},
    telefono:  {type: String, require: true, max: 100}
}
const productosSchema = {
    title: {type: String, require: true, max: 100},
    price: {type: Number, require: true},
    thumbnail: {type: String, require: true, max: 100}
}

const collectionSchema = new mongoose.Schema(schemaMensajes)
const collections = mongoose.model("mensajes", collectionSchema)
const mensajes = new MongoDb(collections);

const collectionUserSchema = new mongoose.Schema(userSchema)
const collectionUser = mongoose.model("usuarios", collectionUserSchema)
const usuarios = new MongoDb(collectionUser)

const collectionProductosSchema = new mongoose.Schema(productosSchema)
const collectionProductos = mongoose.model("productos", collectionProductosSchema)
const productos = new MongoDb(collectionProductos)

const obtenerMensajes = async () => await mensajes.getAll()
const obtenerProductos = async () => await productos.getAll()
const eliminarProductos = async () => await productos.deleteAll()
const guardarProductos = async (producto) => await productos.save(producto)
const obtenerUsuario = async (user) => await usuarios.getByMail(user)
const guardarUsuario = async (user) => await usuarios.save(user)
const guardarMensaje = async (msj) => await mensajes.save(msj)

module.exports = {guardarMensaje, guardarUsuario, obtenerUsuario, obtenerMensajes, obtenerProductos, eliminarProductos, guardarProductos}