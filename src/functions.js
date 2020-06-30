const { writeJson, readJson } = require("fs-extra")

const readBooks = async (filePath) => {
    try {
        const books = await readJson(filePath)
        return books
    } catch (error) {
        throw new Error(error)
    }
}

const writeBooks = async (filePath, data) => {
    try {
        await writeJson(filePath, data)
    } catch (error) {
        throw new Error(error)
    }
}
const readComments = async (filePath) => {
    try {
        const comments = await readJson(filePath)
        return comments
    } catch (error) {
        throw new Error(error)
    }
}

const writeComments = async (filePath, data) => {
    try {
        await writeJson(filePath, data)
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    readBooks,
    writeBooks,
    readComments,
    writeComments
}