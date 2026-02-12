const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const User = require('../../schema/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buyrole')
        .setDescription('🎨 Купить кастомную роль (10000 монет)'),

    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user) {
            return interaction.reply({ content: '❌ Профиль не найден.', ephemeral: true });
        }

        if (user.coins < 10000) {
            return interaction.reply({ 
                content: `❌ Недостаточно монет! Нужно 10000, у тебя ${user.coins}.`, 
                ephemeral: true 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('buyrole_modal')
            .setTitle('🎨 Создание кастомной роли');

        const nameInput = new TextInputBuilder()
            .setCustomId('role_name')
            .setLabel('Название роли')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Введи название роли (например: VIP, Элита, Кот)')
            .setRequired(true)
            .setMaxLength(30);

        const colorInput = new TextInputBuilder()
            .setCustomId('role_color')
            .setLabel('Цвет роли (HEX)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#FF0000 или FF0000')
            .setRequired(true)
            .setMaxLength(7);

        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        const secondRow = new ActionRowBuilder().addComponents(colorInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    }
};