const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Система браков (в разработке)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Кого хочешь позвать?')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('💍 Система браков')
            .setDescription('⏳ **Команда в разработке!**\nСкоро ты сможешь заключать браки, копить любовь и покупать колечки 💞')
            .setFooter({ text: 'Следи за обновлениями!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};