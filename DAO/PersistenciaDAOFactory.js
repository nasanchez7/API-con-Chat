const MemoriaDao = require('../Contenedores/contenedorMemoriaDAO')
const MongoDbDao = require('../Contenedores/contenedorMongoDbDAO')
const ArchivoDao = require('../Contenedores/contenedorArchivoDAO')

class persistenciaDAOFactory{

    static get(tipo, collection){
        switch(tipo){
            case 'MEM': return new MemoriaDao()
            case 'FILE': return new ArchivoDao(process.cwd() + '/db.json')
            case 'MONGO': return new MongoDbDao(collection)
            default: return new MemoriaDao()
        }
    }
}

module.exports = persistenciaDAOFactory