const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Показывает твой профиль')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Пользователь для просмотра')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const stats = {
            messages: 1250,
            voice: 3420,
            coins: 8750,
            level: 17,
            exp: 420,
            expNext: 645,
            pair: 'Sliks#1234',
            clan: 'Moonlight'
        };

        const embed = new EmbedBuilder()
            .setColor('#9b87f8')
            .setAuthor({ 
                name: user.username, 
                iconURL: user.displayAvatarURL() 
            })
            .setDescription(`**${user.username} Profile**`)
            .addFields(
                { 
                    name: '📊 Статистика', 
                    value: `\`\`\`Сообщения: ${stats.messages}\nВойс: ${stats.voice} мин\nМонеты: ${stats.coins}\`\`\``,
                    inline: true 
                },
                { 
                    name: '👥 Социальное', 
                    value: `\`\`\`Пара: ${stats.pair}\nКлан: ${stats.clan}\`\`\``,
                    inline: true 
                },
                { 
                    name: '📈 Прогресс', 
                    value: `\`\`\`Уровень: ${stats.level}\nXP: ${stats.exp}/${stats.expNext}\`\`\``,
                    inline: false 
                }
            )
            .setFooter({ 
                text: `Создан: ${user.createdAt.toLocaleDateString('ru-RU')} | Зашёл: ${member.joinedAt.toLocaleDateString('ru-RU')}` 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};