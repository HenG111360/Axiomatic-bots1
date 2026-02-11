const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check Bot ping'),
	async execute(interaction) {

		const exampleembed = new EmbedBuilder().setAuthor({
			name: `${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL()
		}).setDescription(`**Current Ping is ${interaction.client.ws.ping} ms \n Bot uptime - ${interaction.client.uptime} ms**`)

		await interaction.reply({ embeds: [exampleembed] });
	},
};