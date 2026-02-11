const mongoose = require("mongoose")

const entriesschema = mongoose.Schema({

    messageid: { type: String },
    guildid: { type: String },
    userid: { type: String }

})

module.exports = mongoose.model("entries", entriesschema)