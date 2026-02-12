const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../schema/User');

const workJobs = [
    'разносил пиццу 🍕', 'программировал на Python 🐍', 'делал уборку 🧹',
    'торговал на рынке 🏪', 'стриг газоны 🌿', 'мыл машины 🚗',
    'учил котов дискорду 🐱', 'играл в доте за донатера 🎮',
    'пел в караоке 🎤', 'работал таксистом 🚕', 'рисовал мемы 🎨',
    'тестировал баги 🐛', 'писал документацию 📄'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('💼 Поработать и заработать монеты + XP'),

    async execute(interaction) {
        await interaction.deferReply();

        let user = await User.findOne({ userId: interaction.user.id });
        if (!user) user = new User({ userId: interaction.user.id });

        const earnings = Math.floor(Math.random() * 200) + 50; // 50–250 монет
        const xpGain = Math.floor(Math.random() * 15) + 5;    // 5–20 XP
        const job = workJobs[Math.floor(Math.random() * workJobs.length)];

        user.coins += earnings;
        user.xp += xpGain;

        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) user.level = newLevel;

        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#00ff9d')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('💼 Работа')
            .setDescription(`Ты **${job}** и заработал:\n💰 **${earnings}** монет\n✨ **${xpGain}** XP`)
            .setFooter({ text: `Баланс: ${user.coins} монет | Уровень: ${user.level}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};