const Persistencia = require('../Persistencia/persistencia.js')

const obtenerProductos = async () => await Persistencia.obtenerProductos() 
const obtenerMensajes = async () => await Persistencia.obtenerMensajes()
const eliminarProductos = async () => await Persistencia.eliminarProductos()
const guardarProductos = async (producto) => await Persistencia.guardarProductos(producto)
const obtenerUsuario = async (user) => await Persistencia.obtenerUsuario(user) 
const guardarUsuario = async (user) => await Persistencia.guardarUsuario(user)
const guardarMensaje = async (msj) => await Persistencia.guardarMensaje(msj)

module.exports = {guardarMensaje, guardarUsuario, obtenerUsuario, obtenerMensajes, eliminarProductos, guardarProductos, obtenerProductos}