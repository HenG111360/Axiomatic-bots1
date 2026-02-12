const { MessageType, EmbedBuilder, codeBlock, time, Events, Collection, AttachmentBuilder } = require('discord.js');
const register = require('../helpers/register');
const token = process.env.TOKEN;
const { request } = require('undici');
const fs = require('fs');
const path = require('node:path');
const User = require('../schema/User');

const botevents = ({ client, commands }) => {

    client.on(Events.InteractionCreate, async interaction => {
        // ---------- КНОПКИ ----------
        if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId);
            if (button) await button.execute(interaction);
            return;
        }

        // ---------- МОДАЛЬНОЕ ОКНО (ПОКУПКА РОЛИ) ----------
        if (interaction.isModalSubmit() && interaction.customId === 'buyrole_modal') {
            await interaction.deferReply({ ephemeral: true });

            const roleName = interaction.fields.getTextInputValue('role_name');
            let roleColor = interaction.fields.getTextInputValue('role_color');
            
            // Валидация HEX-цвета
            if (!roleColor.startsWith('#')) roleColor = '#' + roleColor;
            if (!/^#[0-9A-F]{6}$/i.test(roleColor)) {
                return interaction.editReply({ content: '❌ Неверный формат цвета. Используй HEX (например, #FF0000 или FF0000).' });
            }

            const userData = await User.findOne({ userId: interaction.user.id });
            if (!userData || userData.coins < 10000) {
                return interaction.editReply({ content: '❌ Недостаточно монет или профиль не найден.' });
            }

            try {
                // Создаём роль
                const role = await interaction.guild.roles.create({
                    name: roleName,
                    color: roleColor,
                    reason: `Кастомная роль для ${interaction.user.tag}`,
                    permissions: []
                });

                // Выдаём роль
                await interaction.member.roles.add(role);

                // Списываем монеты и сохраняем в БД
                userData.coins -= 10000;
                if (!userData.customRoles) userData.customRoles = [];
                userData.customRoles.push({
                    roleId: role.id,
                    name: roleName,
                    color: roleColor,
                    price: 10000,
                    createdAt: Date.now()
                });
                await userData.save();

                const embed = new EmbedBuilder()
                    .setColor(roleColor)
                    .setTitle('✅ Роль успешно создана!')
                    .setDescription(`Ты приобрёл кастомную роль **${roleName}** за 10000 💰`)
                    .addFields(
                        { name: 'Цвет', value: roleColor, inline: true },
                        { name: 'ID роли', value: role.id, inline: true },
                        { name: 'Новый баланс', value: `${userData.coins} 💰`, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ Ошибка при создании роли. Убедись, что у бота есть права "Управлять ролями".' });
            }
            return;
        }

        // ---------- SLASH-КОМАНДЫ ----------
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // ---------- КУЛДАУНЫ ----------
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                const exampleEmbed = new EmbedBuilder()
                    .setDescription(`**Please wait, you are on a cooldown till <t:${expiredTimestamp}:T>.**`);
                return interaction.reply({ embeds: [exampleEmbed] });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // ---------- ВЫПОЛНЕНИЕ КОМАНДЫ ----------
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const date = new Date();
            const timeString = time(date);
            const channel = client.channels.cache.get("1015498504992460840");
            const code = codeBlock('js', `${error}`);
            const exampleEmbed = new EmbedBuilder()
                .setTitle("Reporting an error")
                .setDescription(`${code}`)
                .setColor('Red')
                .setAuthor({ 
                    name: `${client.user.username}`, 
                    iconURL: client.user.displayAvatarURL() 
                })
                .addFields(
                    { name: "Command used", value: `</${interaction.commandName}:${interaction.commandId}>`, inline: true },
                    { name: "Channel", value: `${interaction.channel?.name || 'DM'}`, inline: true },
                    { name: "Time", value: `${timeString}`, inline: true }
                )
                .setFooter({ 
                    text: `Used By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });
            try {
                await interaction.reply({ 
                    content: "Oh no I am facing some errors reporting problem to our developers", 
                    ephemeral: true 
                });
            } catch (e) {}
            if (channel) {
                channel.send({ embeds: [exampleEmbed] }).catch(() => {});
            }
        }
    });

    client.once(Events.ClientReady, c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    // ==================== XP ЗА СООБЩЕНИЯ ====================
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        let user = await User.findOne({ userId: message.author.id });
        if (!user) {
            user = new User({ userId: message.author.id });
            await user.save();
        }

        user.messages += 1;
        user.xp += 0.5; // 0.5 XP за сообщение

        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) user.level = newLevel;

        await user.save();

        // ОСТАЛЬНАЯ ЛОГИКА
        if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == MessageType.Reply) {
            return false;
        }

        if (message.content.includes("Honami sync")) {
            if (message.author.id === "979661273820168193") {
                register({ commands: commands, token: token, message: message });
                return;
            }
        }
    });

    // ==================== XP ЗА ВОЙС ====================
    const voiceSessions = {};

    client.on("voiceStateUpdate", async (oldState, newState) => {
        const member = newState.member;
        if (!member || member.user.bot) return;
        const userId = member.id;

        if (!oldState.channel && newState.channel) {
            voiceSessions[userId] = Date.now();
        }

        if (oldState.channel && !newState.channel) {
            if (voiceSessions[userId]) {
                const seconds = Math.floor((Date.now() - voiceSessions[userId]) / 1000);
                delete voiceSessions[userId];

                let user = await User.findOne({ userId });
                if (!user) user = new User({ userId });

                user.voiceTime += seconds;
                user.xp += Math.floor(seconds * 0.02 * 100) / 100;

                const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
                if (newLevel > user.level) user.level = newLevel;

                await user.save();
            }
        }
    });
};

module.exports = botevents;