

module.exports = {
    data: { name: `purgeconfirm` },
    async execute(interaction) {

        await interaction.channel.clone().then(async (clonedchannel) => {
            const original = interaction.channel.position
            await clonedchannel.setPosition(original)
            clonedchannel.send(`Deleted All messages in ${clonedchannel.name}`)
        }).catch((err) => {
            console.log(err)
        });
        await interaction.reply("Done")
        await interaction.channel.delete()


    }

}