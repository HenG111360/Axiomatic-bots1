const mongoose =  require("mongoose")

const ytschema = mongoose.Schema({
    channelid : {type : String},
    ytid : {type : String},
    roleid : {type : String},
    guildid : {type : String},
    latestid : {type : String}
})

module.exports = mongoose.model("yt", ytschema)