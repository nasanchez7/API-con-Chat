const knex = require('knex');

class Contenedor{
    constructor(options, table ){
        this.connection = knex(options);
        this.table = table;
    }

    async createTable(){
        const exists = await this.connection.schema.hasTable(this.table)
        if(!exists){
            await this.connection.schema.createTable(this.table, (table) => {
                    table.increments("id").primary
                    table.string("title").notNullable()
                    table.float("price")
                    table.string("thumbnail").notNullable()
            })
        }
    }

    async save(objeto){
        await this.createTable()
        await this.connection(this.table).insert(objeto)
    }

    async getById(id){
        await this.createTable()
        return await this.connection(this.table).where('id', id)
    }

    async getAll(){
        await this.createTable()
        return await this.connection(this.table)
    }

    async deleteById(id){
        await this.createTable()
        await this.connection(this.table).where('id', id).del()
        return id
    } 
    async deleteAll(){
        await this.createTable()
        await this.connection(this.table).del()
    }
}

module.exports = Contenedor