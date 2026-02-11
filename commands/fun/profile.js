const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

const marriageSchema = new mongoose.Schema({
    user1: String,
    user2: String,
    date: Date,
    lastPaid: Date
});

const Marriage = mongoose.models.Marriage || mongoose.model('Marriage', marriageSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Показывает твой профиль')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Выбери пользователя')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        // ========== ПРОВЕРКА БРАКА ==========
        let married = null;
        const marriage1 = await Marriage.findOne({ user1: user.id });
        const marriage2 = await Marriage.findOne({ user2: user.id });
        
        if (marriage1) {
            const spouse = await interaction.client.users.fetch(marriage1.user2);
            married = {
                user: spouse,
                date: marriage1.date
            };
        } else if (marriage2) {
            const spouse = await interaction.client.users.fetch(marriage2.user1);
            married = {
                user: spouse,
                date: marriage2.date
            };
        }

        // ========== ПРОФИЛЬ ==========
        const embed = new EmbedBuilder()
            .setColor(married ? '#ff69b4' : '#9b87f8')
            .setAuthor({ 
                name: user.username, 
                iconURL: user.displayAvatarURL() 
            })
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: '📊 Статистика',
                    value: '```Сообщения: 0\nВойс: 0 мин\nМонеты: 0```',
                    inline: false
                },
                {
                    name: '💍 Брак',
                    value: married 
                        ? `💞 **В браке с:** ${married.user}\n📅 **С:** <t:${Math.floor(married.date / 1000)}:D>`
                        : '💔 **Не в браке**',
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