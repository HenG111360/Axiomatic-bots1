const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: { name: `ticket` },
    async execute(interaction) {
        const channel = await interaction.guild.channels.create({
            name: `${interaction.user.username} Ticket `,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: interaction.client.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },

            ]
        })

        const cancel = new ButtonBuilder()
            .setCustomId('ticketclose')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Success).setEmoji("🎫");

        const row = new ActionRowBuilder()
            .addComponents(cancel);

        const exampleEmbed = new EmbedBuilder().setDescription("**Close Ticket , Dont use it until a moderator ask you to do so **").setColor("Green")
        await channel.send({
            embeds: [exampleEmbed],
            components: [row]
        })

        interaction.reply({content : `Channel Created` , ephemeral : true})
    }



}