const { MessageType, EmbedBuilder, codeBlock, time, Events, Collection, AttachmentBuilder } = require('discord.js');
const register = require('../helpers/register');
const { token } = require("../config.json")
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
const fs = require('fs');
const path = require('node:path');

const botevents = ({ client, commands }) => {

    client.on(Events.InteractionCreate, async interaction => {

        if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId)
            await button.execute(interaction);
            return
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
                const exampleEmbed = new EmbedBuilder().setDescription(`**Please wait, you are on a cooldown till <t:${expiredTimestamp}:T>.**`)
                return interaction.reply({ embeds: [exampleEmbed] });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            const date = new Date();
            const timeString = time(date);
            const channel = client.channels.cache.get("1015498504992460840");
            const code = codeBlock('js', `${error}`)
            const exampleEmbed = new EmbedBuilder().setTitle("Reporting an error").setDescription(
                `${code}`
            ).setColor('Red').setAuthor({
                name: `${client.user.username}`, iconURL: client.user.displayAvatarURL()
            }).addFields({ name: "Command used", value: `</${interaction.commandName}:${interaction.commandId}>`, inline: true }, { name: "Channel", value: `${interaction.channel.name}`, inline: true }, { name: "Time", value: `${timeString}`, inline: true }).setFooter({
                text: `Used By ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            await interaction.reply("Oh no I am facing some erros reporting problem to our developers")
            channel.send({ embeds: [exampleEmbed] })
            console.log(error)
        }
    });

    client.once(Events.ClientReady, c => {
        return console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    client.on("messageCreate", async (message) => {
        if (message.author.bot) {
            return;
        }

        if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == MessageType.Reply) { 
            return false 
        }

        if (message.content.includes("Honami sync")) {
            if (message.author.id === "979661273820168193") {
                register({ commands: commands, token: token, message: message })
                return;
            } else {
                return;
            }
        }
    });
}

module.exports = botevents