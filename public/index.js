const socket = io()

socket.on('connection', (socket) => { 
    console.log('Usuario conectado')  
})

socket.on('mensajes', (data) => {
    const listaMensajes = document.getElementById("mensajes")
    data.forEach((mensaje)=>{
        const mensajeContainer = document.createElement('div')
        mensajeContainer.className = "mensaje"
        mensajeContainer.innerHTML = `
        <h3 class="email"> ${mensaje.email} </h3> <h3  class="fecha"> ${mensaje.fecha}: </h3> <h4> ${mensaje.mensaje} </h4>
        `
        listaMensajes.appendChild(mensajeContainer)
    })
})

socket.on('mensajeNuevo', (data) => {
    const listaMensajes = document.getElementById("mensajes")
    const mensajeContainer = document.createElement('div')
    mensajeContainer.className = "mensaje"
    mensajeContainer.innerHTML = `
        <h3 class="email"> ${data.email} </h3> <h3  class="fecha"> ${data.fecha}: </h3> <h4> ${data.mensaje} </h4>
        `
    listaMensajes.appendChild(mensajeContainer)
})


socket.on('productos', (data) => {
    const listaProductos = document.getElementById("listaProductos")
    data.forEach(producto => {
        const productoFila = document.createElement("tr");
        productoFila.innerHTML = `
                            <td> ${producto.title} </td>
                            <td> ${producto.price} </td>
                            <td><img src=${producto.thumbnail} alt=${producto.title}></td>
        `
        listaProductos.appendChild(productoFila)
    });
})

socket.on('productoNuevo', (data) => {
    const listaProductos = document.getElementById("listaProductos")
    const productoFila = document.createElement("tr");
    productoFila.innerHTML = `
                            <td> ${data.title} </td>
                            <td> ${data.price} </td>
                            <td><img src=${data.thumbnail} alt=${data.title}></td>
        `
    listaProductos.appendChild(productoFila)
})



const enviarMensaje = (e) => {
    console.log(e)
    const title = document.getElementById("title").value
    const price = document.getElementById("price").value
    const thumbnail = document.getElementById("thumbnail").value
    const mensaje = {
        title: title,
        price: price,
        thumbnail: thumbnail
    }
    socket.emit('producto', mensaje)
    return false
}

const nuevoMensaje = (e) => {
    console.log(e)

    const email = document.getElementById("email").value
    const mensaje = document.getElementById("mensaje").value

    const mensajeNuevo = {
        email: email,
        mensaje: mensaje,
        fecha: new Date().toLocaleString()
    }

    socket.emit('mensaje', mensajeNuevo)

    return false
}
