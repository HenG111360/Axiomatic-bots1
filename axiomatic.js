const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js');
const token = process.env.TOKEN;
const musicevent = require('./events/musicevent')
const botevent = require("./events/bot events")
const Connectdb = require("./helpers/database")
const checkyt = require("./events/ytevents")
const endgiveaway = require("./helpers/giveawayhandler")

var cron = require('node-cron');

cron.schedule('5 * * * *', () => {
	console.log('running every minute 5');
});

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ], 
    presence: { 
        status: 'dnd', 
        activities: [{ 
            name: "Axiomatic", 
            type: ActivityType.Competing 
        }] 
    } 
});

const fs = require('node:fs');
const path = require('node:path');

const commands = [];
client.cooldowns = new Collection();
client.commands = new Collection();
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
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const buttons = [];
client.buttons = new Collection()
const buttonPath = path.join(__dirname, `buttons`)
const buttonFolder = fs.readdirSync(buttonPath);

for (const folder of buttonFolder) {
    const buttonsPath = path.join(buttonPath, folder)
    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);
        const button = require(filePath);
        if ('data' in button && 'execute' in button) {
            buttons.push(JSON.stringify(button));
            client.buttons.set(button.data.name, button);
        } else {
            console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { setInterval } = require('node:timers');

client.distube = new DisTube(client, {
    leaveOnEmpty: true,
    leaveOnFinish: true,
    plugins: [new SpotifyPlugin()],
    emptyCooldown: 30
});

musicevent({ client: client })
botevent({ client: client, commands: commands, buttons: buttons })
Connectdb()
setInterval(checkyt, 600000);
setInterval(endgiveaway, 18000000)
client.login(token);