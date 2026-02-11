const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("ban").setDescription("Ban a user from guild id or mention both work").addUserOption(option => option.setName("user").setDescription("Select user or provide id").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Optional reason")),

    async execute(interaction) {

        const { user, options } = interaction
        const reason = options.getString("reason")
        const banuser = options.getMember("user")
        const targetUserRolePosition = banuser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;
        const { EmbedBuilder } = require('discord.js');


        interaction.channel.sendTyping()

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)){
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Ban permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;

        }

        if (banuser.id === interaction.guild.ownerId) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't ban that user because they're the server owner.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= requestUserRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't ban that user because they have the same/higher role than you.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= botRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**I can't ban that user because they have the same/higher role than me.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }

        if (!banuser) {
            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
            interaction.reply({ embeds: [exampleEmbed] })
            return;
        }
        else {

            if (!reason) {
                const exampleEmbed = new EmbedBuilder().setAuthor({
                    name: `${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL()
                }).setDescription(`**Successfully Banned ${banuser.user.username} **`).addFields({ name: 'Action performed By', value: `${user.username}`, inline: true },
                    { name: "Reason", value: `Not provided` }).setFooter({
                        text: ` Requested By ${user.username}`,
                        iconURL: user.displayAvatarURL()
                    })
                banuser.ban(banuser)
                await interaction.reply({ embeds: [exampleEmbed] })
            }

            else {
                const exampleEmbed = new EmbedBuilder().setAuthor({
                    name: `${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL()
                }).setDescription(`**Successfully Banned ${banuser.user.username} **`).addFields({ name: 'Action performed By', value: `${user.username}`, inline: true },
                    { name: "Reason", value: `${reason}` }).setFooter({
                        text: ` Requested By ${user.username}`,
                        iconURL: user.displayAvatarURL()
                    })
                banuser.ban(banuser)
                await interaction.reply({ embeds: [exampleEmbed] })

            }
        }
    }
}