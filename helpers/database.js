const mongoose = require("mongoose");
require('dotenv').config();

const Connectdb = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then((data) => { 
            console.log("✅ Db connected successfully!"); 
        })
        .catch((error) => {
            console.error("❌ Db connection error:", error);
        });
}

module.exports = Connectdb;