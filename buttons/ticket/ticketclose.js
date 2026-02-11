module.exports = {
    data: { name: `ticketclose` },
    async execute(interaction) {
        await interaction.channel.delete()
        try {
            interaction.user.send("ticket closed")
        } catch (e) {
            return

        }
    }

}