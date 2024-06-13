const mongoose = require("mongoose")

const connection = async () => {
    try {
        await mongoose.connect(`${process.env.CONNECTION_STRING}`)
        console.log("Connected to db");
    } catch (err) {
        console.log(err);
    }
}

connection()