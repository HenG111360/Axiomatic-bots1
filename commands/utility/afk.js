const afk = require("../../schema/afkschema")
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder().setName("afk").setDescription("Set or remove afk").addSubcommand
        (subcommand => subcommand.setName("set").setDescription("Set Afk").addStringOption(option =>
            option.setName("reason").setDescription("Reason For afk"))),

    async execute(interaction) {

        const { options } = interaction
        const reason = options.getString("reason")
        const subcommand = options.getSubcommand()

        switch (subcommand) {
            case "set":
                const test = await afk.findOne({ userid: interaction.user.id, guildid: interaction.guild.id })
                console.log(test)
                if (!test) {
                    
                    await afk.create({ userid: interaction.user.id, guildid: interaction.guild.id, reason: reason })
                    const exampleEmbed = new EmbedBuilder().setDescription(`Afk set For reason **${reason}**`)
                    await interaction.reply({ embeds: [exampleEmbed] })
                }

                else {
                    const exampleEmbed = new EmbedBuilder().setDescription(`You are Already Afk send a message in chat to remove it `)
                    await interaction.reply({ embeds: [exampleEmbed] })
                }
                break
        }

    }

}