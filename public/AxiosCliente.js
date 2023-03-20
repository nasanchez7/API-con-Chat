const guardarProducto = async () => {
    const producto = {
        title: "Producto de prueba",
        price: 2000,
        thumbnail: "./productoprueba.jpg"
    }
    await axios.post('/producto', producto)
    console.log('Producto de prueba guardado')
}

const obtenerProductos = async () => {
    const productos = await axios.get('/productos')
    console.log(productos.data)
}

const eliminarProductos = async () => {
    await axios.delete('/vaciarCarrito')
    console.log('Productos eliminados')
} 

