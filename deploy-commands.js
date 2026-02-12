const { REST, Routes } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands/fun').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/fun/${file}`);
    commands.push(command.data.toJSON());
    console.log(`✅ Загружена команда: ${command.data.name}`);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🚀 Регистрирую ${commands.length} команд...`);
        console.log('Команды:', commands.map(c => c.name).join(', '));

        const data = await rest.put(
            Routes.applicationCommands('1470876464198062090'),
            { body: commands }
        );

        console.log(`✅ Успешно зарегистрировано ${data.length} команд!`);
        console.log('Зарегистрированы:', data.map(c => c.name).join(', '));
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
    }
})();