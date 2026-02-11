const mongoose = require("mongoose")

const warnschema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },

    reason: { type: String },
    userid: { type: String },
    modid: { type: String }


})

module.exports = mongoose.model("warn", warnschema)