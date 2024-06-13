const { authenticateToken } = require("./userAuth");
const User = require("../Models/user");
const router = require("express").Router();

//put book to cart
router.put("/add-to-cart", authenticateToken,async(req,res)=>{
    try {
        const {bookid , id} = req.headers;
        const userData = await User.findById(id);
        const isBookinCart = userData.cart.includes(bookid)
        if(isBookinCart){
            return res.json({
                status: "success",
                message: "Book is already in the cart"
            })
        }
        await User.findByIdAndUpdate(id,{
            $push:{cart:bookid},
        })
        return res.json({
            status: "success",
            message: "Book added to cart"
        })
    } catch (error) {
        console.log(error);
     return res.status(500).json({message:"An error accurred"})
    }
})

//remove book from cart

router.put("/remove-from-cart/:bookid", authenticateToken,async(req,res)=>{
    try {
        const {bookid} = req.params;
        const {id} = req.headers;
        await User.findByIdAndUpdate(id,{
            $pull:{cart:bookid},
        })
        return res.json({
            status: "success",
            message: "Book removed from cart"
        })
    } catch (error) {
        console.log(error);
     return res.status(500).json({message:"An error accurred"})
    }
})

//get cart of a perticular user
router.get("/get-user-cart", authenticateToken,async(req,res)=>{
    try {
        const {id} = req.headers;
        const userData = await User.findById(id).populate("cart")
        const cart = userData.cart.reverse();
        return res.json({
            status: "success",
            data: cart,
        });
    } catch (error) {
        console.log(error);
     return res.status(500).json({message:"An error accurred"})
    }
})

module.exports = router;