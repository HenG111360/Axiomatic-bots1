const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time, codeBlock } = require(`discord.js`)
const warn = require("../../schema/warnschmea")


module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("warn").setDescription("Warn any user add or remove it or get info").setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).
        addSubcommand(subcommand =>
            subcommand.setName("add").setDescription("Add warn to any Member of your server").addUserOption(option => option.setName("user").setDescription("select user you want to warn").setRequired(true)).addStringOption(option => option.setName("reason").setDescription("Give reason for future uses").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('info').setDescription("Get info of warns").addUserOption(option => option.setName("user").setDescription("select user you want to warn").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove').setDescription("remove warn using warn id").addStringOption(option => option.setName("warnid").setDescription("Use /warn info to get Warn id").setRequired(true)).addUserOption(option => option.setName("user").setDescription("select user you want remove warn from").setRequired(true))),

    async execute(interaction) {
        const { options } = interaction
        const subcommand = options.getSubcommand()
        const member = options.getMember("user")
        const reason = options.getString("reason")
        const targetUserRolePosition = member.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        await interaction.channel.sendTyping()

        if (member.id === interaction.guild.ownerId) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't Warn or Remove warn of This user because they're the server owner.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= requestUserRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't Warn or Remove Warn of this user because they have the same/higher role than you.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= botRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**I can't Warn or Remove warn of This user because they have the same/higher role than me.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }

        else {
            try {
                switch (subcommand) {

                    case "add":
                        if (member) {
                            const check = await warn.findOne({ userid: member.id })
                            if (check) {
                                await warn.insertMany({ reason: reason, userid: member.id, modid: interaction.user.id })
                                const exampleEmbed = new EmbedBuilder().setDescription(`**${member.user.username} Has been warned for ${reason}**`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }

                            else {
                                await warn.insertMany({ reason: reason, userid: member.id, modid: interaction.user.id })
                                const exampleEmbed = new EmbedBuilder().setDescription(`**${member.user.username} Has been warned for ${reason}**`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }

                        }
                        else {
                            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        break

                    case "info":
                        if (member) {
                            const check = await warn.findOne({ userid: member.id })
                            if (check) {
                                const cmap = await warn.find({ userid: member.id })
                                const amount = await warn.count({ userid: member.id })
                                const exampleEmbed = new EmbedBuilder().setDescription(`${cmap.map((item, index) =>
                                    `**#${index + 1}**\n Reason - ** ${item.reason} ** \n Warn id - ${codeBlock(item.id)} \n Time of warn - ${time(item.date)}\n Mod responsible - <@${item.modid}>\n\n`).join(" ")}`).setTitle(`${member.user.username}'s ${amount} Warnings Found `)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }

                            else {
                                const exampleEmbed = new EmbedBuilder().setDescription(`**${member.user.username} Dont have any warnings till now**`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }

                        }
                        else {
                            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        break

                    case "remove":
                        const id = options.getString("warnid")

                        if (member) {
                            const check = await warn.findOneAndDelete({ _id: id, userid: member.id })
                            if (check) {
                                const exampleEmbed = new EmbedBuilder().setDescription(`Removed Warn of ${member.user.username}`).addFields(
                                    { name: "Warn added By", value: `<@${check.modid}>` },
                                    { name: "Warn Removed By", value: `<@${interaction.user.id}>` },
                                    { name: "Reason Of warning", value: `${check.reason}` },
                                    { name: "Warned At ", value: `${time(check.date)}` })
                                    .setAuthor({
                                        name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()
                                    }).setFooter({
                                        text: `Used By ${interaction.user.username}`,
                                        iconURL: interaction.user.displayAvatarURL()

                                    })
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }
                            else {
                                const exampleEmbed = new EmbedBuilder().setDescription(`**${member.user.username}  warn id did not matched with the one you provided**`)
                                await interaction.reply({ embeds: [exampleEmbed] })
                            }

                        }
                        else {
                            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
                            await interaction.reply({ embeds: [exampleEmbed] })
                        }
                        break




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
                console.log(err)
                return;
            }
        }


    }
}