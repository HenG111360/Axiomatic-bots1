const { SlashCommandBuilder, codeBlock, time } = require('discord.js');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Play music bruh")
        .addSubcommand(
            subcommand =>
                subcommand.setName("play")
                    .setDescription("play bruh")
                    .addStringOption(option =>
                        option.setName("name")
                            .setDescription("Provide name of music or url")
                            .setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName("stop")
            .setDescription("Stop Music"))
        .addSubcommand(subcommand => subcommand.setName("skip")
            .setDescription("Skip Music"))
        .addSubcommand(subcommand => subcommand.setName("queue")
            .setDescription("See all songs in queue"))
        .addSubcommand(subcommand => subcommand.setName("jump")
            .setDescription("Jump to song  see queue to get song number").addIntegerOption(option =>
                option.setName("number")
                    .setDescription("Provide Song number")
                    .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("loop").setDescription("Loop songs or queue")
            .addStringOption(option => option.setName("loop").setDescription("choose loop mode").addChoices(
                { name: "off", value: "off" },
                { name: "song", value: "song" },
                { name: "queue", value: "queue" }

            ).setRequired(true)))
    ,

    async execute(interaction) {
        const { options, member, channel, guild } = interaction
        const query = options.getString("name")
        const num = options.getInteger("number")
        const voicechannel = member.voice.channel
        const botvc = interaction.guild.members.me.voice.channel
        const subcommand = options.getSubcommand()


        if (!voicechannel) {
            await interaction.channel.sendTyping()
            const exampleEmbed = new EmbedBuilder().setDescription("**Please Join a vc then use this command**").setColor(`Blue`)
            return interaction.reply({ embeds: [exampleEmbed] })
        }

        if (!botvc || voicechannel.id == botvc.id) {
            try {
                switch (subcommand) {
                    case "play":
                        interaction.client.distube.play(voicechannel, query, {
                            textChannel: channel,
                            member: member,
                        })
                        await interaction.reply({ content: 'Requesting Song please wait a moment', ephemeral: true });
                        await interaction.channel.sendTyping()
                        break

                    case "stop":
                        const queue = await interaction.client.distube.getQueue(voicechannel)
                        if (!queue) {
                            await interaction.channel.sendTyping()
                            const exampleEmbed = new EmbedBuilder().setDescription("**No song Playing**").setColor(`Blue`)
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        else {
                            interaction.client.distube.stop(voicechannel)
                            await interaction.channel.sendTyping()
                            const exampleEmbed = new EmbedBuilder().setDescription("**Stopping music**").setColor(`Blue`)
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        break

                    case "skip":
                        const queuek = await interaction.client.distube.getQueue(voicechannel)
                        if (!queuek) {
                            await interaction.channel.sendTyping()
                            const exampleEmbed = new EmbedBuilder().setDescription("**No songs in Queue**").setColor(`Blue`)
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        else {
                            if (queuek.songs.length <= 1) {
                                await interaction.channel.sendTyping()
                                const exampleEmbed = new EmbedBuilder().setDescription("**No songs in queue to skip**").setColor(`Blue`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }
                            else {
                                interaction.client.distube.skip(voicechannel)
                                const exampleEmbed = new EmbedBuilder().setDescription("**Skipping Song**").setColor(`Blue`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }
                        }
                        break
                    case "queue":
                        const qlist = await interaction.client.distube.getQueue(voicechannel)
                        if (!qlist) {
                            await interaction.channel.sendTyping()
                            const exampleEmbed = new EmbedBuilder().setDescription("**No songs in queue**").setColor(`Blue`)
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        else {
                            const exampleEmbed = new EmbedBuilder().setColor(0x0099FF).setTitle(`Queue List`).setDescription(`${qlist.songs.map((song, id) =>
                                `**${id + 1}**. [${song.name}] - \`${song.formattedDuration}\``
                            ).join("\n")}`)

                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        break

                    case "jump":
                        const qcheck = await interaction.client.distube.getQueue(voicechannel)

                        if (!qcheck) {
                            await interaction.channel.sendTyping()
                            const exampleEmbed = new EmbedBuilder().setDescription("**No songs in queue to Jump**").setColor(`Blue`)
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }

                        else {
                            if (qcheck.songs.length <= 1) {
                                await interaction.channel.sendTyping()
                                const exampleEmbed = new EmbedBuilder().setDescription("**Add More songs into queue to access this feature**").setColor(`Blue`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }
                            else {
                                if (parseInt(num) <= qcheck.songs.length) {
                                    const q = parseInt(num) - 1
                                    interaction.client.distube.jump(voicechannel, q)
                                    const exampleEmbed = new EmbedBuilder().setDescription("**Jumping on song Please wait**").setColor(`Blue`)
                                    await interaction.reply({ embeds: [exampleEmbed] })
                                    await interaction.channel.sendTyping()
                                }
                                else {
                                    await interaction.channel.sendTyping()
                                    const exampleEmbed = new EmbedBuilder().setDescription("**I am sorry No number like that exist in queue please check again**").setColor(`Blue`)
                                    await interaction.reply({ embeds: exampleEmbed })
                                }
                            }
                        }
                        break


                    case "loop":

                        const option = options.getString("loop")



                        const queuecheck = await interaction.client.distube.getQueue(voicechannel)

                        if (!queuecheck) {
                            const exampleEmbed = new EmbedBuilder().setColor('Red').setDescription("**Please add some songs in queue first**")
                            return interaction.reply({ embeds: [exampleEmbed] })
                        }


                        let mode = null
                        switch (option) {

                            case "off":
                                { mode = 0 }
                                break;
                            case "song":
                                { mode = 1 }
                                break
                            case "queue":
                                { mode = 2 }
                                break
                        }



                        mode = await interaction.client.distube.setRepeatMode(guild, mode)

                        mode = mode ? mode == 2 ? "Repeat queue" : "Repeat song" : "Off";

                        const exampleEmbed = new EmbedBuilder().setDescription(`**Set Repeat Mode to ${mode}**`)
                        await interaction.reply({ embeds: [exampleEmbed] })
                        return;

                }
            } catch (err) {
                const date = new Date();
                const timeString = time(date);
                const channel = interaction.client.channels.cache.get("1015498504992460840");
                const code = codeBlock('js', `${err}`)
                const exampleEmbed = new EmbedBuilder().setTitle("Reporting an error").setDescription(
                    `${code}`
                ).setColor('Red').setAuthor({
                    name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()
                }).addFields({ name: "Command used", value: `</${interaction.commandName}:${interaction.commandId}>`, inline: true }, { name: "Channel", value: `${interaction.channel.name}`, inline: true }, { name: "Time", value: `${timeString}`, inline: true }).setFooter({
                    text: `Used By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()

                })
                await interaction.reply("Oh no I am facing some erros reporting problem to our developers")
                channel.send({ embeds: [exampleEmbed] })
                return;
            }
        }

        else {
            const exampleEmbed = new EmbedBuilder().setDescription(`**I think i am already playing music in ${botvc.name}**`).setColor(`Blue`)
            await interaction.reply({ embeds: [exampleEmbed] })
            return
        }
    }



}