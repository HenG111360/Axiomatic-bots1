const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require(`discord.js`)

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("unmute").setDescription("Unmute user who was previously muted").addUserOption(option => option.setName("user").setDescription("select user").setRequired(true)),

    async execute(interaction) {
        const { options } = interaction
        const member = options.getMember("user")

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)){
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Moderate Member permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }

        if (member) {
            const check = member.isCommunicationDisabled()
            if (check) {
                member.timeout()
                const exampleEmbed = new EmbedBuilder().setDescription(`**Unmuted ${member.user.username}**`)
                await interaction.reply({ embeds: [exampleEmbed] })
            }
            else {
                const exampleEmbed = new EmbedBuilder().setDescription("**Member was Not Muted**")
                await interaction.reply({ embeds: [exampleEmbed] })
            }

        }
        else {
            const exampleEmbed = new EmbedBuilder().setDescription("**Member Not Found**")
            await interaction.reply({ embeds: [exampleEmbed] })
        }
    }
}