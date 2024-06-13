const { authenticateToken } = require("./userAuth");
const Book = require("../Models/book");
const router = require("express").Router();
const Order = require("../Models/order");
const User = require("../Models/user");
const Stripe = require('stripe');




//place order
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const Auser = await User.findById(id);
        const stripe = new Stripe(process.env.Stripe_SECRET_KEY);
        const { order, ticketPrice } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: 'http://localhost:5173//profile/orderHistory',
            cancel_url: 'http://localhost:5173/cart',
            client_reference_id: id,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: ticketPrice * 100,
                    product_data: {
                        name: Auser.username,
                        description: Auser.email,
                    }
                },
                quantity: 1
            }]
        });

        const url = session.url

        for (const orderData of order) {

            const newOrder = new Order({ user: id, book: orderData._id, session: session.id });
            const orderDataFromDb = await newOrder.save();
            //saving order in user model
            await User.findByIdAndUpdate(id, {
                $push: { orders: orderDataFromDb._id },
            });
            //clearing cart
            await User.findByIdAndUpdate(id, {
                $pull: { cart: orderData._id },
            });
        }
        console.log(session);
        return res.json({
            status: "success",
            message: "Order placed successfully",
            session
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occuped" })
    }
})


//Empty cart
router.put("/empty-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { order } = req.body;

        for (const orderData of order) {
            //clearing cart
            await User.findByIdAndUpdate(id, {
                $pull: { cart: orderData._id },
            });
        }
        return res.json({
            status: "success",
            message: "Cart is empty!!!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occuped" })
    }
})




// get order history of perticular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate({
            path: "orders",
            populate: { path: "book" },
        });

        const ordersData = userData.orders.reverse();
        return res.json({
            status: "success",
            data: ordersData

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error Occured" })
    }
})

//get all orders ---admin
router.get("/get-all-orders", authenticateToken, async (req, res) => {
    try {
        const userData = await Order.find()
            .populate({
                path: "book",
            })
            .populate({
                path: "user",
            })
            .sort({
                createdAt: -1,
            })
        return res.json({
            status: "success",
            data: userData,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error accurred" })
    }
})

//update order --admin
router.put("/update-status/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await Order.findByIdAndUpdate(id, { status: req.body.status });
        return res.json({
            status: "success",
            message: "Status Updated Successfully",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error accurred" })
    }
})

module.exports = router;