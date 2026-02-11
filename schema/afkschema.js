const mongoose = require("mongoose")

const afkschema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    userid: { type: String },
    guildid: { type: String },
    reason : {type : String}


})

module.exports = mongoose.model("afk", afkschema)