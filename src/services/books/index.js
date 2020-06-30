const express = require("express")
const { join } = require("path")
const { readBooks, writeBooks, readComments, writeComments } = require("../../functions")
const { check, validationResult, sanitizeBody } = require("express-validator")
const uniqid = require("uniqid")


const booksPath = join(__dirname, "books.json")
const commentsPath = join(__dirname, "../comments/comments.json")

const router = express.Router()

router.get("/", async (req, res, next) => {
    try {
        const books = await readBooks(booksPath)
        res.status(200).send(books)
    } catch (error) {
        console.log(error)
        const err = new Error("While reading books list a problem occurred!")
        next(err)
    }
})

router.get("/:asin", async (req, res, next) => {
    try {
        const books = await readBooks(booksPath)
        const findBook = books.find(book => book.asin === req.params.asin)

        if (findBook) {
            res.status(200).send(findBook)
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        console.log(error)
        const err = new Error("While reading books list a problem occurred!")
        next(err)
    }
})

router.post("/",
    [
        check("asin").exists().withMessage("Every books should have an ID"),
        check("title").exists().withMessage("Every books should have a title"),
        check("img").exists().withMessage("Every books should have an image"),
        check("category").exists().withMessage("Every books should have a category"),
        check("price").exists().withMessage("Every books should have a price"),
        sanitizeBody("price").toFloat()
    ],
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const err = new Error()
            err.httpStatusCode = 400
            err.message = errors
            next(err)
        }
        try {
            const books = await readBooks(booksPath)
            const findBook = books.find(book => book.asin === req.body.asin)
            if (findBook) {
                const err = new Error()
                err.httpStatusCode = 400
                err.message = "Cant add the same book!"
                next(err)
            } else {
                books.push(req.body)
                await writeBooks(booksPath, books)
                res.status(201).send("Created")
            }
        } catch (error) {
            next(error)
        }
    })

router.put("/:asin", async (req, res, next) => {
    try {
        const books = await readBooks(booksPath)
        const findBook = books.find(book => book.asin === req.params.asin)
        if (findBook) {
            const index = books.indexOf(findBook)
            const updatedBook = { ...findBook, ...req.body }
            books[index] = updatedBook
            await writeBooks(booksPath, books)
            res.status(200).send("Updated")
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

router.delete("/:asin", async (req, res, next) => {
    try {
        const books = await readBooks(booksPath)
        const findBook = books.find(book => book.asin === req.params.asin)

        if (findBook) {
            await writeBooks(booksPath, books.filter(book => book.asin !== req.params.asin))
            res.status(200).send("Deleted")
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }

    } catch (error) {
        next(error)
    }
})

router.get("/:asin/comments", async (req, res, next) => {
    try {
        const comments = await readComments(commentsPath)
        const booksComments = comments.filter(comment => comment.bookID === req.params.asin)
        if (booksComments.length > 0) {
            res.status(200).send(booksComments)
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        console.log(error)
        const err = new Error("While reading books list a problem occurred!")
        next(err)
    }
})
router.post("/:asin/comments", [
    check("bookID").exists().withMessage("Every comment should have the books ID"),
    check("username").exists().withMessage("Every comment should have a username"),
    check("text").exists().withMessage("Every comment should contain a text"),
    check("text").isLength({ min: 5 }).withMessage("The text should be at least 5 char")
], async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new Error()
        err.httpStatusCode = 400
        err.message = errors
        next(err)
    } else {
        try {
            const comments = await readComments(commentsPath)
            const newComment = { commentID: uniqid(), ...req.body, date: new Date() }

            comments.push(newComment)

            await writeComments(commentsPath, comments)
            res.status(201).send("New comment was added")
        } catch (error) {
            next(error)
        }
    }

})
router.delete("/comments/:id", async (req, res, next) => {
    try {
        const comments = await readComments(commentsPath)
        const findComment = comments.find(comment => comment.commentID === req.params.id)

        if (findComment) {
            await writeComments(commentsPath, comments.filter(comment => comment.commentID !== req.params.id))
            res.status(200).send("Deleted")
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router