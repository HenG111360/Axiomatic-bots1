const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require(`discord.js`)
const ms = require(`ms`)

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("mute").setDescription("Mute any member you want using user provided time").addStringOption(option => option.setName("time").setDescription("Enter time Like 2s , 1d 10h").setRequired(true)).addUserOption(option => option.setName("user").setDescription("User you want to mute in server").setRequired(true)),

    async execute(interaction) {
        const { options } = interaction
        const unpuretime = options.getString("time")
        const member = options.getMember("user")
        const targetUserRolePosition = member.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;


        await interaction.channel.sendTyping()

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)){
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Moderate Member permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }

        if (member.id === interaction.guild.ownerId) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't mute that user because they're the server owner.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= requestUserRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You can't mute that user because they have the same/higher role than you.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (targetUserRolePosition >= botRolePosition) {
            const exampleEmbed = new EmbedBuilder().setDescription("**I can't mute that user because they have the same/higher role than me.**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }






        if (member) {
            const puretime = ms(unpuretime)
            console.log(puretime)
            if (puretime) {
                member.timeout(puretime)
                const exampleEmbed = new EmbedBuilder().setDescription(`**Timeouted ${member.user.username} for ${unpuretime}**`)
                await interaction.reply({ embeds: [exampleEmbed] })

            }
            else {
                const exampleEmbed = new EmbedBuilder().setDescription("**Please enter correct time**")
                await interaction.reply({ embeds: [exampleEmbed] })
            }
        }

        else {
            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
            await interaction.reply({ embeds: [exampleEmbed] })
        }

    }
}