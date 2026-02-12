const { MessageType, EmbedBuilder, codeBlock, time, Events, Collection, AttachmentBuilder } = require('discord.js');
const register = require('../helpers/register');
const token = process.env.TOKEN;
const { request } = require('undici');
const fs = require('fs');
const path = require('node:path');
const User = require('../schema/User');

const botevents = ({ client, commands }) => {

    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId);
            if (button) await button.execute(interaction);
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

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

        // Пересчёт уровня: level = floor(sqrt(xp / 100)) + 1
        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            // можно отправить уведомление о повышении уровня
        }

        await user.save();

        // ===== ОСТАЛЬНАЯ ЛОГИКА (НЕ ТРОГАЕМ) =====
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

        // Зашёл в голосовой
        if (!oldState.channel && newState.channel) {
            voiceSessions[userId] = Date.now();
        }

        // Вышел из голосового
        if (oldState.channel && !newState.channel) {
            if (voiceSessions[userId]) {
                const seconds = Math.floor((Date.now() - voiceSessions[userId]) / 1000);
                delete voiceSessions[userId];

                let user = await User.findOne({ userId });
                if (!user) {
                    user = new User({ userId });
                }

                user.voiceTime += seconds;
                // 0.02 XP за секунду (с округлением до сотых)
                user.xp += Math.floor(seconds * 0.02 * 100) / 100;

                const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
                if (newLevel > user.level) user.level = newLevel;

                await user.save();
            }
        }

        // Перемещение между каналами — не сбрасываем сессию
    });
};

module.exports = botevents;