const servicio = require('../Servicio/servicio.js')
const winston = require('winston')
const graphQl = require('graphql')


const schemaProducto = graphQl.buildSchema(`
    type Producto{
        _id: ID!
        title: String!
        price: Int!
        thumbnail: String!
    }
    input ProductoInput {
        title: String!
        price: Int!
        thumbnail: String!
    }
    type Query {
        obtenerProductos: [Producto]
    }
    type Mutation {
        eliminarProductos(type: String): [Producto]
    }
`)

const eliminarProductos = async ({type}) => {
    const productos = await servicio.obtenerProductos()
    if(type=="all"){
        await servicio.eliminarProductos()
        return productos
    }
    return productos
}
const obtenerProductos = async () => {
    const productos = await servicio.obtenerProductos()
    return productos
}

module.exports = {eliminarProductos, obtenerProductos, schemaProducto} 