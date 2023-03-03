const DAOpersistencia = require('../DAO/DAOpersistencia');
const fs = require('fs');
const { guardarObjetoConId } = require('../DTO/persistenciaDTO');

class ArchivoDao extends DAOpersistencia{
    constructor(nombreArchivo){
        super()
        this.nombreArchivo = nombreArchivo
    }

    async leer(archivo){
        return JSON.parse(await fs.promises.readFile(archivo, 'utf-8'))
    }

    async guardar(archivo, datos){
        await fs.promises.writeFile(archivo, JSON.stringify(datos, null, '\t'))
    }

    async save(objeto){
        try {
            const archivo = await this.leer(this.nombreArchivo)
            const id = this.getNextId(this.persistencia)
            const obj = guardarObjetoConId(objeto, id)
            await archivo.push(obj)
            await this.guardar(this.nombreArchivo, archivo)
        } catch (error) {
            console.log('Error al guardar elemento')
        }
    }

    async getById(id){
        try {
            if(id){
                const persistencia = await this.leer(this.nombreArchivo)
                const index = persistencia.findIndex(elemento => elemento.id == id)
                return index >= 0 ? [persistencia[index]] : []
            }
        } catch (error) {
            console.log('Error al obtener elemento')
        }
    }

    async getByMail(userEmail){
        try {
            if(userEmail){
                const persistencia = await this.leer(this.nombreArchivo)
                const elemento = persistencia.find(element => element.email > userEmail);
                return elemento
            }
        } catch (error) {
            console.log('Error al obtener elemento')
        }
    }

    async getAll(){
        return await this.leer(this.nombreArchivo)
    }

    async deleteById(id){
        try {
            if(id){
                const archivo = await this.leer(this.nombreArchivo)
                const elemento = await this.getElement(id, archivo)
                const indice = await archivo.findIndex(elemento)
                if(indice !== -1){
                    archivo.splice(indice, 1)
                    await this.guardar(this.nombreArchivo, archivo)
                }else{
                    console.log('Elemento no encontrado')
                }
            }
        } catch (error) {
            console.log('Error al obtener elemento')
        }
    } 

    async deleteAll(){
        try {
            const archivo = await this.leer(this.nombreArchivo)
            await archivo.splice(0, archivo.length)
            await this.guardar(this.nombreArchivo, archivo)
        } catch (error) {
            console.log('Error al eliminar datos')
        }
    }

}

module.exports = ArchivoDao