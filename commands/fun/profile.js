const { SlashCommandBuilder, EmbedBuilder, time } = require(`discord.js`)


module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("profile").setDescription("See user Profile and info using this command").addUserOption(option => option.setName("user").setDescription("Select Whose profile you want to see or use Id")),

    async execute(interaction) {
        const { options } = interaction
        const member = options.getMember("user")
        await interaction.channel.sendTyping()
        if (!member) {
            const exampleEmbed = new EmbedBuilder().setTitle(`${interaction.user.username} Profile`).setThumbnail(interaction.user.displayAvatarURL()).addFields
                ({ name: "Created At", value: `${time(interaction.user.createdAt)}` }, { name: `Joined At`, value: `${time(interaction.member.joinedAt)}` }, { name: `Highest Role`, value: `${interaction.member.roles.highest}` })
            interaction.reply({ embeds: [exampleEmbed] })
            return;
        }

        else {
            const exampleEmbed = new EmbedBuilder().setTitle(`${member.user.username} Profile`).setThumbnail(member.user.displayAvatarURL()).addFields
                ({ name: "Created At", value: `${time(member.user.createdAt)}` }, { name: `Joined At`, value: `${time(member.joinedAt)}` }, { name: `Highest Role`, value: `${member.roles.highest}` })
            interaction.reply({ embeds: [exampleEmbed] })
            return;
        }
    }
}