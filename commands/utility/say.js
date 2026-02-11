const { SlashCommandBuilder, PermissionFlagsBits  , EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Let bot speak for you').addStringOption(option =>
            option.setName("content")
                .setDescription("Content you want bot to say ")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.channel.sendTyping()
        const { options } = interaction
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Messages permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        const content = options.getString("content")
        await interaction.reply({ content: "Done", ephemeral: true })
        await interaction.channel.send(`${content}`);
    },
};