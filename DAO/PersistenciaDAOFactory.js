const MemoriaDao = require('../Contenedores/contenedorMemoriaDAO.js')
const MongoDbDao = require('../Contenedores/contenedorMongoDbDAO.js')
const ArchivoDao = require('../Contenedores/contenedorArchivoDAO.js')

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