const knex = require('knex');

class Mensajes {
    constructor(options, table ){
        this.connection = knex(options);
        this.table = table;
    }

    async createTable(){
        const exists = await this.connection.schema.hasTable(this.table)
        if(!exists){
            await this.connection.schema.createTable(this.table, (table) => {
                    table.string("email").notNullable()
                    table.string("mensaje").notNullable()
                    table.string("fecha").notNullable()
            })
        }
    }

    async save(objeto){
        await this.createTable()
        await this.connection(this.table).insert(objeto)
    }

    async getAll(){
        await this.createTable()
        return await this.connection(this.table)
    }
}

module.exports = Mensajes