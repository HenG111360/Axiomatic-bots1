const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

// ========== СХЕМА БРАКА ==========
const marriageSchema = new mongoose.Schema({
    user1: { type: String, required: true, unique: true },
    user2: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    lastPaid: { type: Date, default: Date.now }
});

const Marriage = mongoose.models.Marriage || mongoose.model('Marriage', marriageSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('💍 Предложить пользователю вступить в брак')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Кого ты хочешь позвать?')
                .setRequired(true)),
    
    async execute(interaction) {
        const proposer = interaction.user;
        const target = interaction.options.getUser('user');

        // ========== ПРОВЕРКИ ==========
        if (target.id === proposer.id) {
            return interaction.reply({ 
                content: '❌ **Ты не можешь жениться на себе!**', 
                ephemeral: true 
            });
        }

        if (target.bot) {
            return interaction.reply({ 
                content: '❌ **Нельзя жениться на боте!**', 
                ephemeral: true 
            });
        }

        // Проверка, не женаты ли уже
        const existing1 = await Marriage.findOne({ user1: proposer.id });
        const existing2 = await Marriage.findOne({ user2: proposer.id });
        const existing3 = await Marriage.findOne({ user1: target.id });
        const existing4 = await Marriage.findOne({ user2: target.id });

        if (existing1 || existing2) {
            return interaction.reply({ 
                content: '❌ **Ты уже состоишь в браке!**', 
                ephemeral: true 
            });
        }

        if (existing3 || existing4) {
            return interaction.reply({ 
                content: '❌ **Этот пользователь уже состоит в браке!**', 
                ephemeral: true 
            });
        }

        // ========== СОЗДАЁМ КНОПКИ ==========
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_marry')
                    .setLabel('💞 Принять')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('decline_marry')
                    .setLabel('💔 Отказать')
                    .setStyle(ButtonStyle.Danger)
            );

        // ========== EMBED ==========
        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('💍 ПРЕДЛОЖЕНИЕ РУКИ И СЕРДЦА')
            .setDescription(`${proposer} сделал(а) предложение ${target}!`)
            .addFields(
                { name: '👰 Жених/Невеста', value: `${proposer}`, inline: true },
                { name: '🤵 Жених/Невеста', value: `${target}`, inline: true },
                { name: '⏳ Статус', value: '⏳ **Ожидание ответа...**', inline: false }
            )
            .setFooter({ text: 'У вас есть 60 секунд, чтобы ответить' })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed], 
            components: [row] 
        });

        // ========== СОЗДАЁМ COLLECTOR ==========
        const filter = i => {
            return i.user.id === target.id && 
                   (i.customId === 'accept_marry' || i.customId === 'decline_marry');
        };

        const collector = interaction.channel.createMessageComponentCollector({ 
            filter, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.customId === 'accept_marry') {
                // ========== СОЗДАЁМ БРАК В БД ==========
                await Marriage.create({
                    user1: proposer.id,
                    user2: target.id,
                    date: new Date(),
                    lastPaid: new Date()
                });

                const acceptEmbed = new EmbedBuilder()
                    .setColor('#ff69b4')
                    .setTitle('💞 БРАК ЗАКЛЮЧЁН!')
                    .setDescription(`${proposer} и ${target} теперь муж и жена!`)
                    .addFields(
                        { name: '📅 Дата свадьбы', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
                        { name: '💍 Статус', value: '✅ В браке', inline: true },
                        { name: '💰 Плата', value: '1000 монет/месяц', inline: false }
                    )
                    .setFooter({ text: 'Не забудьте продлевать брак каждый месяц!' })
                    .setTimestamp();

                await i.update({ embeds: [acceptEmbed], components: [] });

                // ========== ОТПРАВКА В ЛС ==========
                try {
                    await target.send(`💞 **Поздравляем!** Вы приняли предложение ${proposer.tag}!\nТеперь вы муж и жена!`);
                    await proposer.send(`💞 **Поздравляем!** ${target.tag} принял(а) твоё предложение!\nТеперь вы муж и жена!`);
                } catch (error) {
                    console.log('Не удалось отправить ЛС');
                }

            } else if (i.customId === 'decline_marry') {
                const declineEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('💔 ОТКАЗ')
                    .setDescription(`${target} отклонил(а) предложение ${proposer}.`)
                    .setFooter({ text: 'В следующий раз повезёт!' })
                    .setTimestamp();

                await i.update({ embeds: [declineEmbed], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⏰ ВРЕМЯ ВЫШЛО')
                    .setDescription(`${proposer}, ${target} не ответил(а) на предложение.`)
                    .setTimestamp();

                interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    }
};