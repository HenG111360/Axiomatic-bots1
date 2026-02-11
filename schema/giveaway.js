const mongoose = require("mongoose")

const giveawayschema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    messageid: { type: String },
    guildid: { type: String },
    prize: { type: String },
    dbrole: { type: String },
    dbbypass: { type: String },
    entries: { type: Number },
    channelid: { type: String },
    endtime: { type: String },
    inmemory: {
        type: String,
        default: "No"
    }


})

module.exports = mongoose.model("giveaway", giveawayschema)