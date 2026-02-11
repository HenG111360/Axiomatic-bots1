const { REST, Routes, } = require('discord.js');
const { EmbedBuilder } = require('discord.js');



const register = ({ commands , token, message }) => {


    const rest = new REST().setToken(token);
    (async () => {
        try {
            const exampleembed = new EmbedBuilder().setDescription(`Started refreshing ${commands.length} application (/) commands.`)
            message.channel.send({ embeds: [exampleembed] })
            const data = await rest.put(
                Routes.applicationCommands("1118015355714015252"),
                { body: commands },


            );
            const exampleembed1 = new EmbedBuilder().setDescription(`Successfully reloaded ${data.length} application (/) commands.`)
            message.channel.send({ embeds: [exampleembed1] })



        } catch (error) {
            console.error(error);
        }
    })();

}

module.exports = register