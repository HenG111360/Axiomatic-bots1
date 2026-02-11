const { REST, Routes } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`🚀 Registering ${commands.length} commands...`);

        const data = await rest.put(
            Routes.applicationCommands("1470876464198062090"),
            { body: commands },
        );

        console.log(`✅ Successfully registered ${data.length} commands!`);
    } catch (error) {
        console.error(error);
    }
})();