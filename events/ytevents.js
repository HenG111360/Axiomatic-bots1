const Parser = require('rss-parser')
let parser = new Parser();
const yt = require('../schema/ytschema');


const CORS_PROXY = "https://thingproxy.freeboard.io/fetch/"




const checkyt = async () => {
    const data = await yt.find()
    await data.map(async data => {
        
        const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${data.ytid}`)
        const latid = feed.items[0].id
        if (data.latestid === latid) {
            return;
        }

        else {
            const { EmbedBuilder } = require('discord.js');
            const client = require(`../honami`)
            // const yt = require('../schema/ytschema');
            // const exampleEmbed = new EmbedBuilder().setTitle(`${feed.items[0].title}`).setDescription(`${feed.items[0].link}`).setAuthor({
            //     name: `${feed.items[0].author}`,
            //     url: `${feed.link}`
            // })
            const channel = client.channels.cache.get(`${data.channelid}`)
            await yt.updateOne({ channelid: data.channelid }, { $set: { latestid: latid } })
            await channel.send({ content: `<@&${data.roleid}> Hey everyone ${feed.items[0].author} Just Uploaded a new video \n${feed.items[0].link}` })
        }
    }
    )
}


module.exports = checkyt