module.exports = {
    data: { name: `test` },
    async execute(interaction) {
        await interaction.reply("Button is working")
    }

}