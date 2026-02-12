const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const User = require('../../schema/User');

// ============================================
// 🔥 ТВОЙ ФОН (прямая ссылка)
// ============================================
const BACKGROUND_URL = 'https://i.ibb.co.com/DDWdGwnp/background.jpg';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('📊 Показывает профиль пользователя')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Выбери пользователя')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        // ========== ДАННЫЕ ИЗ MONGODB ==========
        let user = await User.findOne({ userId: target.id });
        if (!user) {
            user = new User({ userId: target.id });
            await user.save();
        }

        // Уровень и XP (формула: level = floor(sqrt(xp / 100)) + 1)
        const xpCurrent = user.xp - (Math.pow(user.level - 1, 2) * 100);
        const xpNeeded = (Math.pow(user.level, 2) * 100) - (Math.pow(user.level - 1, 2) * 100);
        const progressPercent = Math.min((xpCurrent / xpNeeded) * 100, 100);

        // Время в войсе → часы (как "online_hours")
        const voiceHours = Math.floor(user.voiceTime / 3600);

        // ========== КАНВАС ==========
        const canvas = Canvas.createCanvas(1200, 600);
        const ctx = canvas.getContext('2d');

        // 1️⃣ ФОН
        try {
            const bg = await Canvas.loadImage(BACKGROUND_URL);
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        } catch {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2️⃣ ТЁМНАЯ ПРОЗРАЧНАЯ НАКЛАДКА
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ========== СТЕКЛЯННЫЕ ПАНЕЛИ ==========
        ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';

        // Левая панель
        roundRect(ctx, 50, 100, 300, 400, 20);
        ctx.fill();

        // Правая панель
        roundRect(ctx, 850, 100, 300, 400, 20);
        ctx.fill();

        // Центральная панель
        roundRect(ctx, 425, 50, 350, 500, 20);
        ctx.fill();

        ctx.shadowBlur = 0;

        // ========== ЛЕВАЯ ПАНЕЛЬ ==========
        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Сообщений', 100, 150);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(user.messages.toString(), 100, 210);

        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('В топе', 100, 280);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('1000+', 100, 340);

        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Онлайн', 100, 410);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`${voiceHours} ч`, 100, 470);

        // ========== ПРАВАЯ ПАНЕЛЬ ==========
        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Монеты', 900, 150);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#00ff9d';
        ctx.fillText(user.coins.toString(), 900, 210);

        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Алмазы', 900, 280);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#00aaff';
        ctx.fillText(user.diamonds?.toString() || '0', 900, 340);

        ctx.font = '30px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Клан', 900, 410);
        ctx.font = '40px "Arial", sans-serif';
        ctx.fillStyle = '#ff9f7f';
        ctx.fillText(user.clan || 'Нет', 900, 470);

        // ========== ЦЕНТР ==========
        // Аватар
        try {
            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'png', size: 256 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(600, 180, 110, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 490, 70, 220, 220);
            ctx.restore();

            // Красная рамка
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
            ctx.beginPath();
            ctx.arc(600, 180, 114, 0, Math.PI * 2);
            ctx.strokeStyle = '#ff3a3a';
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } catch (e) {}

        // Имя
        ctx.font = 'bold 50px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.fillText(target.displayName, 600, 360, { textAlign: 'center' });
        ctx.shadowBlur = 0;

        // Круг уровня
        ctx.beginPath();
        ctx.arc(600, 460, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1e2a';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(200,30,30,0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff4d4d';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = 'bold 38px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(user.level.toString(), 600, 485, { textAlign: 'center' });

        // ========== ПРОГРЕСС-БАР EXP ==========
        const barX = 400;
        const barY = 540;
        const barWidth = 400;
        const barHeight = 24;

        // Фон бара
        ctx.fillStyle = 'rgba(40,40,50,0.9)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        roundRect(ctx, barX, barY, barWidth, barHeight, 12);
        ctx.fill();

        // Заполнение
        ctx.fillStyle = '#e03333';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff4d4d';
        const fillWidth = (progressPercent / 100) * barWidth;
        roundRect(ctx, barX, barY, fillWidth, barHeight, 12);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Текст EXP
        ctx.font = '22px "Arial", sans-serif';
        ctx.fillStyle = '#dddddd';
        ctx.fillText(`${user.xp.toFixed(1)} / ${xpNeeded.toFixed(1)} EXP`, 600, 600, { textAlign: 'center' });

        // ========== ОТПРАВКА ==========
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile.png' });
        await interaction.editReply({ files: [attachment] });
    }
};

// ========== ФУНКЦИЯ ДЛЯ СКРУГЛЁННЫХ УГЛОВ ==========
function roundRect(ctx, x, y, w, h, r) {
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
    return ctx;
}