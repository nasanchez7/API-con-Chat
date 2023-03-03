const persistenciaDAOFactory = require("../DAO/PersistenciaDAOFactory");

class PersistenciaAPI {
    constructor(collection){
        this.collection = collection
        this.datos = persistenciaDAOFactory.get(process.env.TIPO_PERSISTENCIA, this.collection)
    }

    async save(objeto){
        return await this.datos.save(objeto)
    }

    async getById(id){
        return await this.datos.getById(id)
    }

    async getByMail(userEmail){
        return await this.datos.getByMail(userEmail)
    }

    async getAll(){
        return await this.datos.getAll()
    }

    async deleteById(id){
        return await this.datos.deleteById(id)
    } 

    async deleteAll(){
        return await this.datos.deleteAll()
    }

}

module.exports = PersistenciaAPI