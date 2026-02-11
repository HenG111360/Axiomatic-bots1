const { EmbedBuilder } = require('discord.js');



const musicevent = ({ client }) => {
    client.distube
        .on('playSong', async (queue, song) => {
            if (queue.songs.length <= 1) {
                const exampleEmbed = new EmbedBuilder().setColor(0x0099FF).setTitle(` Playing - ${song.name}`).setDescription(`Playing In our Highest quality Enjoy `).setFooter({
                    text: ` Requested By ${song.user.username}`,
                    iconURL: song.user.displayAvatarURL()
                }).setImage(song.thumbnail).setAuthor({
                    name: `${client.user.username}`, iconURL: client.user.avatarURL()
                }).addFields(
                    { name: 'Next Song in Queue', value: `**No Songs**`, inline: true },
                    { name: 'Song Duration', value: `**${song.formattedDuration}**`, inline: true },

                )
                
                queue.textChannel?.send(
                    { embeds: [exampleEmbed] }
                )
            }

            else {

                const exampleEmbed = new EmbedBuilder().setColor(0x0099FF).setTitle(` Playing - ${song.name}`).setDescription(`Playing In our Highest quality Enjoy `).setFooter({
                    text: ` Requested By ${song.user.username}`,
                    iconURL: song.user.displayAvatarURL()

                }).setImage(song.thumbnail).setAuthor({
                    name: `${client.user.username}`, iconURL: client.user.avatarURL()
                }).addFields(
                    { name: 'Next Song in Queue', value: `**${queue.songs[1].name}**`, inline: true },
                    { name: 'Song Duration', value: `**${song.formattedDuration}**`, inline: true },

                )


                
                queue.textChannel?.send(
                    { embeds: [exampleEmbed] }
                )
            }
        }
        )
    client.distube.on("addSong", (queue, song) => {
        if (queue.songs.length <= 1) {
        }
        else {
            queue.textChannel.send(
                `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}.`
            )
        }
    });
    client.distube.on("searchNoResult", (message, query) => {
        const exampleEmbed = new EmbedBuilder().setColor(0x0099FF).setDescription(`**No result found for ${query}!**`)

        message.textChannel.send({ embeds: [exampleEmbed] })
    });


}

module.exports = musicevent