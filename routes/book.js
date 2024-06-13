const router = require("express").Router();
const jwt = require("jsonwebtoken")
const { authenticateToken } = require("./userAuth");
const User = require("../Models/user");
const Book = require("../Models/book");

//add book admin

router.post("/add-book", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const user = await User.findById(id)
        if (user.role !== "admin") {
            return res.status(400).json({ message: "your not having access to perform this action" })
        }
        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            desc: req.body.desc,
            language: req.body.language,
        });
        await book.save();
        res.status(200).json({ message: "Book Added Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

//update book
router.put("/update-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        await Book.findByIdAndUpdate(bookid, {
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            desc: req.body.desc,
            language: req.body.language,
        })
        return res.status(200).json({ message: "Book updated Successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
})

//delete book

router.delete("/delete-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        await Book.findByIdAndDelete(bookid)
        return res.status(200).json({ message: "Book deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
})

//get all books
router.get("/get-all-books", async (req, res) => {

    const searchKey = req.query.search
    const quary = {
        title: {
            $regex: searchKey, $options: 'i'
        }
    }

    try {
        const books = await Book.find(quary).sort({ createdAt: -1 })
        return res.json({
            status: "Success",
            data: books,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred" });
    }
})

//get recentlly added books

router.get("/get-recent-books", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 }).limit(7)
        return res.json({
            status: "Success",
            data: books,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred" });
    }
})

//get book by id

router.get("/get-book-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id)
        return res.json({
            status: "Success",
            data: book,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred" });
    }
})



module.exports = router;