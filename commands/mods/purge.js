const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, codeBlock, time } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('purge').
        setDescription("Purge some messages or all messages your wish")
        .addSubcommand(
            subcommand => subcommand.setName("messages").setDescription("Delete some messages amount should be less than 100").addNumberOption(
                option => option.setName("amount").setDescription("Enter message amount you want to delete").setRequired(true)
            ))
        .addSubcommand(subcommand => subcommand.setName("all").setDescription("Delete all messages of channel"))
    ,
    async execute(interaction) {
        const { options } = interaction
        const subcommand = options.getSubcommand()






        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Manage Messages  permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;
        }


        try {
            switch (subcommand) {
                case "messages":
                    const num = options.getNumber("amount")
                    if (100 >= num) {
                        const amount = await interaction.channel.bulkDelete(num, true)
                        return interaction.reply({ content: `Deleted ${amount.size} Messages, Remember i cant delete message older than 14 days due to discord api limitations `, ephemeral: true })
                    }
                    else {
                        interaction.reply({ content: "Please enter amount less than or equal to 100", ephemeral: true })
                    }
                    break
                case "all":

                    const cancel = new ButtonBuilder()
                        .setCustomId('purgecancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Success);

                    const confirm = new ButtonBuilder()
                        .setCustomId('purgeconfirm')
                        .setLabel('Confirm')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder()
                        .addComponents(cancel, confirm);



                    const exampleEmbed = new EmbedBuilder().setDescription(`**Are you sure  , You want to delete all message in <#${interaction.channel.id}>> ?  **`).setColor("Red")
                    await interaction.reply({
                        embeds: [exampleEmbed],
                        components: [row],
                        ephemeral: true
                    })


                    break
            }
        } catch (err) {
            const date = new Date();
            const timeString = time(date);
            const channel = interaction.client.channels.cache.get("1015498504992460840");
            const code = codeBlock('js', `${err}`)
            const exampleEmbed = new EmbedBuilder().setTitle("Reporting an error").setDescription(
                `${code}`
            ).setColor('Red').setAuthor({
                name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()
            }).addFields({ name: "Command used", value: `</${interaction.commandName}:${interaction.commandId}>`, inline: true }, { name: "Channel", value: `${interaction.channel.name}`, inline: true }, { name: "Time", value: `${timeString}`, inline: true }).setFooter({
                text: `Used By ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()

            })
            await interaction.reply("Oh no I am facing some erros reporting problem to our developers")
            channel.send({ embeds: [exampleEmbed] })
        }
    },
};





