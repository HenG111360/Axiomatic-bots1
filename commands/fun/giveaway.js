const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require(`discord.js`)
const ms = require(`ms`)
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const giveaway = require('../../schema/giveaway');
const entries = require("../../schema/entries")

module.exports = {
    data: new SlashCommandBuilder().setName("giveaway").setDescription("Start a giveaway Quickly").addStringOption(option => option.setName("time").setDescription("Enter time Like 2s , 1d 10h").setRequired(true)).addUserOption(option => option.setName("host").setDescription("Select who is hosting this giveaway").setRequired(true)).addStringOption(option => option.setName("prize").setDescription("Enter Prize").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("select where you want to host giveaway ")).addRoleOption(option => option.setName("role").setDescription("Select role requirement for giveaway")).addRoleOption(option => option.setName("bypass").setDescription("Seelct which role can bypass role requirements")),

    async execute(interaction) {
        const { options } = interaction
        const channel = options.getChannel("channel")
        const prize = options.getString("prize")
        const time = options.getString("time")
        const role = options.getRole('role')
        const bypassrole = options.getRole("bypass")
        const host = options.getMember("host")


        const puretime = ms(time)

        // if (time.endsWith("s") || 300000 > puretime) {
        //     interaction.reply({ content: "Give away should be minimum 5 minute long" })
        //     return
        // }


        if (puretime) {
            let inmemory = "No"



            const timestamp = Date.now()
            const embedtime = Math.floor((puretime + timestamp) / 1000)


            let roleembed = "No requirements"
            let bypassembed = "No Bypass role"
            let dbrole = "No role"
            let dbbypass = "No bypass"

            if (bypassrole) {
                bypassembed = `<@&${bypassrole.id}>`
                dbbypass = bypassrole.id

            }

            if (role) {

                roleembed = `<@&${role.id}>`
                dbrole = role.id

            }

            if (86400000 >= puretime) {
                inmemory = "Yes"
            }
            const cancel = new ButtonBuilder()
                .setCustomId('enter')
                .setLabel('0')
                .setStyle(ButtonStyle.Success).setEmoji(`🎁`);

            const exampleEmbed = new EmbedBuilder().setTitle(`${prize}`).setDescription(`click 🎁 to enter\n **__Duration__** : Ends in <t:${embedtime}:R> \n Hosted By : <@${host.user.id}>`).addFields({ name: `Requirements`, value: `${roleembed}` }, { name: `Bypass`, value: `${bypassembed}` })

            const row = new ActionRowBuilder()
                .addComponents(cancel);


            let channelsend = interaction.channel

            if (channel) {
                channelsend = channel
                await interaction.reply("Done")
            }

            const msg = await channelsend.send({ embeds: [exampleEmbed], components: [row] })

            await giveaway.create({
                messageid: msg.id,
                guildid: interaction.guild.id,
                prize: prize,
                dbrole: dbrole,
                dbbypass: dbbypass,
                entries: "0",
                channelid: channelsend.id,
                endtime: embedtime,
                inmemory: inmemory
            })

            if (inmemory === "Yes") {

                const end = async () => {
                    const winner = await entries.find(
                        { messageid: msg.id }
                    )

                    
                    const purewinner = winner[(Math.floor(Math.random() * winner.length))]
                

                    const message = await channelsend.messages.fetch(msg.id).then(messages => messages.edit({
                        content: "Giveaway Ended",
                        components: []

                    }))

                    await message.reply(`Giveaway Ended <@${purewinner.userid}> is Winner`)
                    await giveaway.findOneAndDelete({ messageid: time.messageid })
                    await entries.remove({ messageid: time.messageid})
                }

                setTimeout(end, puretime)


            }


        }
        else {
            const exampleEmbed = new EmbedBuilder().setDescription("**Please enter correct time**")
            await interaction.reply({ embeds: [exampleEmbed] })
        }


    }
}