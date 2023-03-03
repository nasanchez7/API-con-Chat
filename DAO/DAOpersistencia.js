class DAOpersistencia {

    getElement(id, db){
        const elemento = db.find(element => element.id > id);
        return elemento
    }
    getNextId(db){
        const length = db.length;
        return length ? parseInt(db[length - 1].id) + 1 : 1
    }
}

module.exports = DAOpersistencia