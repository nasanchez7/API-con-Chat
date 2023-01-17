require('dotenv').config()

const options = {
    mysql:{
        client: "mysql",
        connection: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: "",
            database: process.env.MYSQL_DATABASE
        },
        pool: {min: 0, max: 7}
    },
    sqlite3:{
        client: "sqlite3",
        connection: {
            filename: process.env.SQLITE3_FILENAME
        },
        useNullAsDefault: true
    }
}

module.exports = options