const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛍️ Магазин сервера'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ff9f7f')
            .setTitle('🛍️ Магазин сервера')
            .setDescription('Доступные товары:')
            .addFields(
                {
                    name: '🎨 **Кастомная роль**',
                    value: '**Цена:** 10000 💰\nСоздай свою личную роль с уникальным названием и цветом. Используй `/buyrole`',
                    inline: false
                }
            )
            .setFooter({ text: 'Баланс можно пополнить через /work' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};