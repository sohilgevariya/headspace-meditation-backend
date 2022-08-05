import config from 'config'
import mongoose from 'mongoose'
import express from 'express'
import autoIncrement from 'mongoose-auto-increment'
const mongooseConnection = express()
const dbUrl: any = config.get('db_url')

let connection = mongoose.createConnection(dbUrl,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })

mongoose.connect(
    dbUrl,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }
).then(data => console.log('Database successfully connected')).catch(err => console.log(err))
autoIncrement.initialize(connection)

export { mongooseConnection, autoIncrement }
