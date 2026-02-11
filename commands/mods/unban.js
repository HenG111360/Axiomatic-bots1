const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } = require('discord.js');


module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder().setName("unban").setDescription("unBan a user from server using id ").addStringOption(option => option.setName("id").setDescription("provide id of member you want to unban").setRequired(true)),

    async execute(interaction) {

        const { options } = interaction
        const id = options.getString("id")
        const user = interaction.guild.members.fetch(id)

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)){
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Ban member permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }
        if (user) {
            const date = new Date();
            const timeString = time(date);
            const exampleEmbed = new EmbedBuilder().setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}` }).setDescription(`**Succesfully unbanned ${user.username}**`).setFooter({ text: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL()}` }).addFields({ name: "Unbanned at", value: `${timeString}`, inline: true })
            await interaction.guild.members.unban(user)
            await interaction.reply({ embeds: [exampleEmbed] })
            return;

        }
        else {
            const exampleEmbed = new EmbedBuilder().setDescription(`**User Not found**`)
            await interaction.reply({ embeds: [exampleEmbed] })
            return;
        }
    }
}