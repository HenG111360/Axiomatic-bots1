const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a Ticket System').addChannelOption(option =>
            option.setName("channel")
                .setDescription("Select channel where you want to setup ticket system")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.channel.sendTyping()
        const { options } = interaction
        const channel = options.getChannel("channel")
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Channels permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        else {
            const cancel = new ButtonBuilder()
                .setCustomId('ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Success).setEmoji("🎫");

            const row = new ActionRowBuilder()
                .addComponents(cancel);

            const exampleEmbed = new EmbedBuilder().setDescription("**Create Ticket , Please Dont create ticket for fun**").setColor("Green")
            await channel.send({
                embeds: [exampleEmbed],
                components: [row]
            })
            interaction.reply({ content: "Done", ephemeral: true })
        }
    },
};