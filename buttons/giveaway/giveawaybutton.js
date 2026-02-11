const giveaway = require("../../schema/giveaway")
const entries = require("../../schema/entries")
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    data: { name: `enter` },
    async execute(interaction) {
        const check = await entries.findOne({ messageid: interaction.message.id, userid: interaction.user.id })

        if (check) {
            interaction.reply({ content: "You have already entered This giveaway", ephemeral: true })
            return
        }

        const number = await giveaway.findOne({ messageid: interaction.message.id })

        if (number.dbrole === "No role") {
            console.log("code reaching here")
        }

        else {

            if (!interaction.member.roles.cache.has(number.dbrole) && !interaction.member.roles.cache.has(number.dbbypass)) {

                await interaction.reply(({ content: "You Dont meet requirements to Join this giveaway ", ephemeral: true }))
                return;

            }
        }


        const entry = await entries.create({
            messageid: interaction.message.id,
            guildid: interaction.guild.id,
            userid: interaction.user.id
        })


        const purenumber = parseInt(number.entries) + 1

        const update = await giveaway.findOneAndUpdate({ messageid: `${interaction.message.id}` }, { entries: purenumber })


        const cancel = new ButtonBuilder()
            .setCustomId('enter')
            .setLabel(`${purenumber}`)
            .setStyle(ButtonStyle.Success).setEmoji(`🎁`);

        const row = new ActionRowBuilder()
            .addComponents(cancel);

        interaction.update({ components: [row] })
        interaction.user.send("You have Entered the giveaway Goodluck")




    }

}