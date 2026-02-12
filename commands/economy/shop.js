const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../schema/User');

// ========== СПИСОК ТОВАРОВ ==========
const items = [
    { id: 1, name: '💎 Роль «VIP»', description: 'Особый статус на сервере', price: 5000, roleId: null }, // roleId нужно будет указать
    { id: 2, name: '🎨 Роль «Дизайнер»', description: 'Доступ к дизайн-каналам', price: 3000, roleId: null },
    { id: 3, name: '🎮 Роль «Геймер»', description: 'Игровая роль', price: 2000, roleId: null },
    { id: 4, name: '🕒 Никнейм на 7 дней', description: 'Смена ника на неделю', price: 1000, roleId: null },
    { id: 5, name: '📦 Случайный приз', description: 'Рандомный выигрыш (100–1000 монет)', price: 500, roleId: null }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Магазин ролей и товаров')
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('Показать список товаров'))
        .addSubcommand(sub =>
            sub
                .setName('buy')
                .setDescription('Купить товар по ID')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('ID товара из списка')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            const embed = new EmbedBuilder()
                .setColor('#ff9f7f')
                .setTitle('🛒 Магазин')
                .setDescription('Доступные товары:')
                .setFooter({ text: 'Используй /shop buy <id> для покупки' });

            items.forEach(item => {
                embed.addFields({
                    name: `**${item.id}. ${item.name}** — ${item.price} 💰`,
                    value: item.description,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'buy') {
            const itemId = interaction.options.getInteger('id');
            const item = items.find(i => i.id === itemId);

            if (!item) {
                return interaction.reply({ content: '❌ Товар с таким ID не найден!', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            let user = await User.findOne({ userId: interaction.user.id });
            if (!user) user = new User({ userId: interaction.user.id });

            if (user.coins < item.price) {
                return interaction.editReply({ content: `❌ У тебя недостаточно монет! Нужно: ${item.price}, у тебя: ${user.coins}` });
            }

            // Списываем монеты
            user.coins -= item.price;

            // Если товар — роль
            if (item.roleId) {
                const role = interaction.guild.roles.cache.get(item.roleId);
                if (role) {
                    await interaction.member.roles.add(role);
                }
            }

            // Если товар — случайный приз
            if (item.id === 5) {
                const prize = Math.floor(Math.random() * 900) + 100; // 100–1000
                user.coins += prize;
                await user.save();
                return interaction.editReply({ content: `🎁 Ты выиграл **${prize}** монет! Твой баланс: **${user.coins}**` });
            }

            // Добавляем в инвентарь (для будущих расширений)
            user.inventory.push({ itemId: item.id, purchasedAt: Date.now() });
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Покупка совершена')
                .setDescription(`Ты приобрёл **${item.name}** за **${item.price}** 💰`)
                .setFooter({ text: `Твой баланс: ${user.coins} монет` });

            await interaction.editReply({ embeds: [embed] });
        }
    }
};