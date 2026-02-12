const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schema/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('📊 Показывает твой профиль')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Выбери пользователя')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        let user = await User.findOne({ userId: target.id });
        if (!user) {
            user = new User({ userId: target.id });
            await user.save();
        }

        // Уровень и XP
        const xpCurrent = user.xp - (Math.pow(user.level - 1, 2) * 100);
        const xpNeeded = (Math.pow(user.level, 2) * 100) - (Math.pow(user.level - 1, 2) * 100);
        const progress = Math.round((xpCurrent / xpNeeded) * 10);
        const progressBar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

        // Время в войсе
        const hours = Math.floor(user.voiceTime / 3600);
        const mins = Math.floor((user.voiceTime % 3600) / 60);
        const voiceStr = hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;

        const embed = new EmbedBuilder()
            .setColor(user.marriedTo ? '#ff69b4' : '#2b2d31')
            .setAuthor({ 
                name: target.username, 
                iconURL: target.displayAvatarURL() 
            })
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                {
                    name: '📊 **ОСНОВНАЯ СТАТИСТИКА**',
                    value: `\`\`\`💬 Сообщений: ${user.messages}\n🎧 Войс: ${voiceStr}\n💰 Монет: ${user.coins}\`\`\``,
                    inline: false
                },
                {
                    name: '📈 **ПРОГРЕСС**',
                    value: `**Уровень ${user.level}**\n${progressBar} \`${xpCurrent.toFixed(0)}/${xpNeeded.toFixed(0)} XP\``,
                    inline: false
                },
                {
                    name: '👥 **СОЦИАЛЬНОЕ**',
                    value: `\`\`\`💑 Пара: ${user.marriedTo ? `<@${user.marriedTo}>` : 'Нет'}\n🏰 Клан: ${user.clan || 'Нет'}\`\`\``,
                    inline: false
                },
                {
                    name: '🛒 **КУПЛЕННЫЕ РОЛИ**',
                    value: user.customRoles?.length > 0 
                        ? user.customRoles.map(r => `<@&${r.roleId}>`).join('\n')
                        : 'Нет купленных ролей',
                    inline: false
                }
            )
            .setFooter({ 
                text: `Создан • ${target.createdAt.toLocaleDateString('ru-RU')} | Зашёл • ${member.joinedAt.toLocaleDateString('ru-RU')}` 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};