

module.exports = {
    data: { name: `purgecancel` },
    async execute(interaction) {
        await interaction.update({ content: 'Cancelling', components: []  , embeds : []})

    }

}