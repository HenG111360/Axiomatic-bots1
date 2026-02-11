const { SlashCommandBuilder, EmbedBuilder, time } = require(`discord.js`)


module.exports = {
    data: new SlashCommandBuilder().setName("server").setDescription("Get server Info using this command"),

    async execute(interaction) {
        const { guild } = interaction
        await interaction.channel.sendTyping()
        const desc = guild.description
        let de = null
        if (desc) {
            de = desc
        }
        else {
            de = "No Description"
        }
        const exampleEmbed = new EmbedBuilder().setTitle(`${guild.name} Info`).addFields(
            { name: "Created At", value: `${time(guild.createdAt)}` },
            { name: "Owner", value: `<@${guild.ownerId}>` },
            { name: "Members Count", value: `${guild.memberCount}` },
            { name: "Voice and Text Channel count", value: `${interaction.guild.channels.cache.filter((c) => c.type === 0 || c.type === 2).size}` },
            { name: "Server Premium Status", value: `${guild.premiumTier}` },
            { name: "Server Description", value: `${de}` }
        ).setThumbnail(guild.iconURL()).setAuthor({
            name: `${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL()
        }).setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        interaction.reply({ embeds: [exampleEmbed] })
        return;

    }
}   