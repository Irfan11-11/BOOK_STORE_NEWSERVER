const { authenticateToken } = require("./userAuth");
const User = require("../Models/user");
const router = require("express").Router();

//add book to favorites
router.put("/addBookto-favorite", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavorite = userData.favourites.includes(bookid);
        if (isBookFavorite) {
            return res.status(200).json({
                message: "Book is already in favorites"
            })
        }
        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } })
        return res.status(200).json({ message: "Book added to favorites" })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

//delete book from favorites
router.put("/deleteBookfrom-favorite", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavorite = userData.favourites.includes(bookid);
        if (isBookFavorite) {
            await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } })
        }
        return res.status(200).json({ message: "Book deleted from favorites" })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

//get Favourite books of a particular user
router.get("/get-favourite-books", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate("favourites");
        const favouriteBooks = userData.favourites;
        return res.json({
            status: "Success",
            data: favouriteBooks,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});
module.exports = router;