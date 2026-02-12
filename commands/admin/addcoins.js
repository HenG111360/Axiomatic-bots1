const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../schema/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('💰 Выдать монеты пользователю (только для администраторов)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Кому выдать')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Количество монет')
                .setRequired(true)
                .setMinValue(1))
        // Скрываем команду от всех, у кого нет прав администратора
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Дополнительная проверка (на случай, если права не сработали)
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав администратора для использования этой команды.', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true }); // <-- ОБЯЗАТЕЛЬНО!

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            let user = await User.findOne({ userId: target.id });
            if (!user) {
                user = new User({ userId: target.id });
            }

            user.coins += amount;
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff9d')
                .setTitle('💰 Выдача монет')
                .setDescription(`**${target.username}** получил **${amount}** 💰`)
                .addFields(
                    { name: 'Новый баланс', value: `${user.coins} 💰`, inline: true },
                    { name: 'Администратор', value: interaction.user.username, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: '❌ Произошла ошибка при выполнении команды. Проверь логи.' 
            });
        }
    }
};