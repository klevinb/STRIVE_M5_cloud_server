const express = require("express")
const { badRequest, notFound, genericError } = require("./errorHandlers")
const cors = require("cors")
const booksRouter = require("./services/books")
const listEndpoints = require("express-list-endpoints")
const helmet = require("helmet")


const server = express()

const port = process.env.PORT

const allowedConntections =
    process.env.NODE_ENV = "production"
        ?
        [process.env.FE_URL]
        :
        [process.env.FE_DEV]

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedConntections.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS!"))
        }
    }
}

server.use(express.json())
server.use(cors(corsOptions))
server.use(helmet())

// routes

server.use("/books", booksRouter)

server.use(badRequest)
server.use(notFound)
server.use(genericError)

console.log(listEndpoints(server))

server.listen(port, () => {
    console.log(`Server is running on port : ${port}`)
})
