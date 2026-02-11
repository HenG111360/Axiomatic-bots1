const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

// ============================================
// 👇 ТВОЙ НОВЫЙ ФОН (GIF С ЛУНОЙ)
// ============================================
const BACKGROUND_URL = 'https://files.catbox.moe/20zies.gif';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Показывает красивый профиль с фоном')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Выбери пользователя')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        // ========== СТАТИСТИКА (ПОТОМ ПОДКЛЮЧИШЬ БД) ==========
        const stats = {
            messages: 1250,
            voice: 3420,
            coins: 8750,
            xp: 17420,
            level: 17,
            expCurrent: 420,
            expNext: 645,
            pair: 'Sliks#1234',
            clan: 'Moonlight'
        };

        // ========== СОЗДАЁМ КАРТИНКУ ==========
        const canvas = Canvas.createCanvas(1000, 550);
        const ctx = canvas.getContext('2d');

        // 1️⃣ ЗАГРУЗКА ФОНА (ТВОЯ ГИФКА)
        try {
            const background = await Canvas.loadImage(BACKGROUND_URL);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2️⃣ ПОЛУПРОЗРАЧНЫЕ БЛОКИ
        ctx.fillStyle = 'rgba(20, 20, 30, 0.75)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        roundRect(ctx, 30, 30, 400, 490, 25, true, false);
        
        ctx.fillStyle = 'rgba(25, 25, 35, 0.8)';
        roundRect(ctx, 460, 30, 510, 490, 25, true, false);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 3️⃣ АВАТАР
        try {
            const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(215, 140, 90, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 125, 50, 180, 180);
            ctx.restore();
            
            ctx.beginPath();
            ctx.arc(215, 140, 92, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        } catch (error) {
            console.error('Аватар не загрузился:', error);
        }

        // 4️⃣ ИМЯ
        ctx.font = 'bold 32px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(user.username, 80, 280);
        
        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#b9bbbe';
        ctx.fillText(member.roles.highest.name, 80, 330);
        ctx.shadowBlur = 0;

        // 5️⃣ ЛЕВЫЙ БЛОК (ИНФО)
        ctx.font = 'bold 24px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('👤 ИНФОРМАЦИЯ', 80, 400);
        
        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`📅 Создан: ${user.createdAt.toLocaleDateString('ru-RU')}`, 80, 450);
        ctx.fillText(`📥 Зашёл: ${member.joinedAt.toLocaleDateString('ru-RU')}`, 80, 490);

        // 6️⃣ ПРАВЫЙ БЛОК (ПРОГРЕСС)
        ctx.font = 'bold 28px "Arial", sans-serif';
        ctx.fillStyle = '#9b87f8';
        ctx.fillText('📊 ПРОГРЕСС', 500, 100);
        
        ctx.font = 'bold 22px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Уровень ${stats.level}`, 500, 160);
        
        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#b9bbbe';
        ctx.fillText(`${stats.expCurrent}/${stats.expNext} XP`, 500, 200);
        
        // Прогресс-бар
        const progress = (stats.expCurrent / stats.expNext) * 300;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, 500, 220, 300, 20, 10, true, false);
        ctx.fillStyle = '#9b87f8';
        roundRect(ctx, 500, 220, progress, 20, 10, true, false);
        
        ctx.font = 'bold 22px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('📈 ДЕЯТЕЛЬНОСТЬ', 500, 290);
        
        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`💬 Сообщений: ${stats.messages}`, 500, 340);
        ctx.fillText(`🎧 В войсе: ${Math.floor(stats.voice / 60)} ч ${stats.voice % 60} мин`, 500, 380);
        ctx.fillText(`💰 Монет: ${stats.coins.toLocaleString()}`, 500, 420);
        
        ctx.font = 'bold 22px "Arial", sans-serif';
        ctx.fillStyle = '#ff9f7f';
        ctx.fillText('💝 СОЦИАЛЬНОЕ', 500, 490);
        
        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`💑 Пара: ${stats.pair}`, 500, 540);
        ctx.fillText(`🏰 Клан: ${stats.clan}`, 500, 580);

        // 7️⃣ ОТПРАВКА
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile.png' });
        await interaction.editReply({ files: [attachment] });
    }
};

// ========== ФУНКЦИЯ ДЛЯ СКРУГЛЁННЫХ УГЛОВ ==========
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}