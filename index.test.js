const request = require('supertest')('http://localhost:8000')
const expect = require('chai').expect
const assert = require('assert').strict

describe('test get productos', async () => {
    it('deberia retornar un status 200', async () => {
        const response = await request.get('/productos')
        expect(response.status).to.eql(200)
    })
})

describe('test post productos', async () => {
    it('deberia guardar un producto', async () => {
        const productoPrueba = {
            title: "Producto de prueba",
            price: 2000,
            thumbnail: "./productoprueba.jpg"
        }
        const response = await request.post('/producto').send(productoPrueba)
        expect(response.status).to.eql(200)
    })
})

describe('test delete productos', async () => {
    it('deberia borrar todos los productos', async () => {
        const response = await request.post('/vaciarCarrito')
        expect(response.status).to.eql(302)
    })
})