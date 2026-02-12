const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const User = require('../../schema/User');

// ============================================
// 🔥 ТВОЙ ФОН — ВСТАВЛЕН!
// ============================================
const BACKGROUND_URL = 'https://i.ibb.co/nvCz47s/photo-2026-02-12-18-36-45.jpg';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('📊 Показывает твой профиль с реальной статистикой')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Выбери пользователя')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        // ========== ПОЛУЧАЕМ ДАННЫЕ ИЗ БД ==========
        let user = await User.findOne({ userId: target.id });
        if (!user) {
            user = new User({ userId: target.id });
            await user.save();
        }

        // Расчёт XP до следующего уровня
        const xpCurrent = user.xp - (Math.pow(user.level - 1, 2) * 100);
        const xpNeeded = (Math.pow(user.level, 2) * 100) - (Math.pow(user.level - 1, 2) * 100);
        const progressPercent = Math.min((xpCurrent / xpNeeded) * 100, 100);

        // Форматирование времени в войсе
        const hours = Math.floor(user.voiceTime / 3600);
        const minutes = Math.floor((user.voiceTime % 3600) / 60);
        const voiceStr = hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;

        // ========== СОЗДАЁМ КАНВАС ==========
        const canvas = Canvas.createCanvas(1000, 550);
        const ctx = canvas.getContext('2d');

        // 1️⃣ ЗАГРУЗКА ФОНА
        try {
            const background = await Canvas.loadImage(BACKGROUND_URL);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2️⃣ ПОЛУПРОЗРАЧНЫЕ БЛОКИ
        ctx.fillStyle = 'rgba(20, 20, 30, 0.85)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        roundRect(ctx, 30, 30, 400, 490, 25, true, false);

        ctx.fillStyle = 'rgba(25, 25, 35, 0.9)';
        roundRect(ctx, 460, 30, 510, 490, 25, true, false);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 3️⃣ АВАТАР (круглый)
        try {
            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'png', size: 256 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(215, 140, 90, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 125, 50, 180, 180);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(215, 140, 92, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 4;
            ctx.stroke();
        } catch (e) {}

        // 4️⃣ ИМЯ И ТЕГ
        ctx.font = 'bold 32px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(target.displayName, 80, 280);
        ctx.shadowBlur = 0;

        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#b9bbbe';
        ctx.fillText(`@${target.username}`, 80, 330);

        // 5️⃣ ЛЕВЫЙ БЛОК — СТАТИСТИКА
        ctx.font = 'bold 24px "Arial", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('📊 ОСНОВНАЯ', 80, 400);

        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`💬 Сообщений: ${user.messages}`, 80, 450);
        ctx.fillText(`🎧 Войс: ${voiceStr}`, 80, 490);
        ctx.fillText(`💰 Монет: ${user.coins}`, 80, 530);

        // 6️⃣ ПРАВЫЙ БЛОК — СОЦИАЛЬНОЕ И ПРОГРЕСС
        ctx.font = 'bold 24px "Arial", sans-serif';
        ctx.fillStyle = '#ff9f7f';
        ctx.fillText('👥 СОЦИАЛЬНОЕ', 500, 100);

        ctx.font = '20px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`💑 Пара: ${user.marriedTo ? `<@${user.marriedTo}>` : 'Нет'}`, 500, 150);
        ctx.fillText(`🏰 Клан: ${user.clan || 'Нет'}`, 500, 190);

        ctx.font = 'bold 24px "Arial", sans-serif';
        ctx.fillStyle = '#9b87f8';
        ctx.fillText('📈 ПРОГРЕСС', 500, 270);

        ctx.font = '22px "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${user.level} Уровень`, 500, 330);

        ctx.font = '18px "Arial", sans-serif';
        ctx.fillStyle = '#b9bbbe';
        ctx.fillText(`${user.xp.toFixed(1)} XP`, 500, 380);
        ctx.fillText(`До след. уровня: ${Math.max(0, xpNeeded - xpCurrent).toFixed(1)} XP`, 500, 420);

        // Прогресс-бар
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, 500, 460, 300, 20, 10, true, false);
        ctx.fillStyle = '#9b87f8';
        const progressWidth = (progressPercent / 100) * 300;
        roundRect(ctx, 500, 460, progressWidth, 20, 10, true, false);

        // Дата создания и присоединения
        ctx.font = '14px "Arial", sans-serif';
        ctx.fillStyle = '#80848e';
        ctx.fillText(`Создан: ${target.createdAt.toLocaleDateString('ru-RU')}`, 500, 520);
        ctx.fillText(`Зашёл: ${member.joinedAt.toLocaleDateString('ru-RU')}`, 500, 550);

        // ========== ОТПРАВЛЯЕМ КАРТИНКУ ==========
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile.png' });
        await interaction.editReply({ files: [attachment] });
    }
};

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