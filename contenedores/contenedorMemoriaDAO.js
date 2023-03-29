const  DAOpersistencia  = require('../DAO/DAOpersistencia.js');
const { guardarObjetoConId } = require('../DTO/persistenciaDTO.js');

class MemoriaDAO extends DAOpersistencia{
    constructor(){
        super()
        this.persistencia = []
    }

    save(objeto){
        const id = this.getNextId(this.persistencia)
        const obj = guardarObjetoConId(objeto, id)
        this.persistencia.push(obj)
        return objeto
    }

    getById(id){
        const elementoBuscado = this.persistencia.find(elemento => elemento.id === id)
        return elementoBuscado
    }

    getByMail(userEmail){
        const elementoBuscado = this.persistencia.find(elemento => elemento.email === userEmail)
        return elementoBuscado
    }

    getAll(){
        return this.persistencia
    }

    deleteById(id){
        const elemento = this.getElement(id, this.collections)
        const indice = this.persistencia.findIndex(elemento)
        if(indice !== -1){
            this.persistencia.splice(indice, 1)
        }else{
            console.log('Elemento no encontrado')
        }
    } 

    deleteAll(){
        this.persistencia.splice(0, this.persistencia.length)
    }

}

module.exports = MemoriaDAO