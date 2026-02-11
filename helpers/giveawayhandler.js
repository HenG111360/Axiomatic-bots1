const giveaway = require("../schema/giveaway")
const entries = require("../schema/entries")
const ms = require("ms")




const endgiveaway = async () => {
    const client = require("../honami")

    const data = await giveaway.find()
    await data.map(async (time) => {
        if (86400 > parseInt(time.endtime)) {

            if (time.inmemory === "Yes") {
                return

            }
            const delay = parseInt(time.endtime) - Date.now()
            const update = await giveaway.findOneAndUpdate({ messageid: time.messageid }, { inmemory: "Yes" })

            const end = async () => {
                const winner = await entries.find(
                    { messageid: msg.id }
                )


                const purewinner = winner[(Math.floor(Math.random() * winner.length))]
                const message = await channel.messages.fetch(time.messageid).then(messages => messages.edit({
                    content: "Giveaway Ended",
                    components: []

                }))


                await message.reply(`Giveaway Ended <@${purewinner.userid}> is Winner`)
                await giveaway.findOneAndDelete({ messageid: time.messageid })
                const channel = await client.channels.cache.get(time.channel)


                await message.reply(`Giveaway Ended <@${purewinner.userid}> is Winner`)
                await giveaway.findOneAndDelete({ messageid: time.messageid })
                await entries.remove({ messageid: time.messageid })
            }

            setTimeout(end(), ms(delay))

        }
    })


}

module.exports = endgiveaway