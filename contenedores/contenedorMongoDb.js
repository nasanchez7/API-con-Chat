class MongoDb {
    constructor(collection){
        this.collections = collection
    }

    async save(objeto){
        const saveObjModel = new this.collections(objeto)
        const save = await saveObjModel.save()
        console.log(save)
    }

    async getById(id){
        const elemento = await this.collections.find().where({_id: id});
        console.log(elemento)
    }

    async getAll(){
        const listaElementos = await this.collections.find();
        //console.log(listaElementos)
        return listaElementos
    }

    async deleteById(id){
        const eliminarElemento = await this.collections.deleteOne({_id: id})
        console.log(eliminarElemento)
    } 

    async deleteAll(){
        const eliminarElementos = await this.collections.deleteMany()
        console.log(eliminarElementos)
    }

}

module.exports = MongoDb