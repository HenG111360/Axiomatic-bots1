const {
  SlashCommandBuilder,
  AttachmentBuilder
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const User = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Красивый профиль'),

  async execute(interaction) {

    const userData = await User.findOne({ userId: interaction.user.id });
    if (!userData) {
      return interaction.reply({ content: 'Профиль не найден.', ephemeral: true });
    }

    const width = 900;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === ФОН ===
    const background = await loadImage(path.join(__dirname, '../../assets/background.jpg'));
    ctx.drawImage(background, 0, 0, width, height);

    // Затемнение
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, width, height);

    // === ФУНКЦИЯ СКРУГЛЕННОГО ПРЯМОУГОЛЬНИКА ===
    function roundRect(x, y, w, h, r) {
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
    }

    // === КАРТОЧКИ (GLASS EFFECT) ===
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;

    // Левая
    roundRect(50, 120, 220, 260, 25);
    ctx.fill();
    ctx.stroke();

    // Правая
    roundRect(630, 120, 220, 260, 25);
    ctx.fill();
    ctx.stroke();

    // Центральная
    roundRect(320, 80, 260, 320, 35);
    ctx.fill();
    ctx.stroke();

    // === АВАТАР ===
    const avatar = await loadImage(
      interaction.user.displayAvatarURL({ extension: 'png', size: 512 })
    );

    const avatarSize = 160;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = 90;

    // Красный glow
    ctx.shadowColor = '#ff2e2e';
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e2e';
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // === ИМЯ ===
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(interaction.user.username, width / 2, 300);

    // === КРУГ УРОВНЯ ===
    const level = userData.level;
    const xp = userData.xp;
    const requiredXP = 850;

    const percent = xp / requiredXP;

    const circleX = width / 2;
    const circleY = 350;
    const radius = 45;

    // Фон круга
    ctx.beginPath();
    ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    // Прогресс
    ctx.beginPath();
    ctx.arc(
      circleX,
      circleY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * percent
    );
    ctx.strokeStyle = '#ff2e2e';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(level.toString(), circleX, circleY + 10);

    // === ПРОГРЕСС БАР ===
    const barWidth = 500;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = 430;

    roundRect(barX, barY, barWidth, barHeight, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();

    roundRect(barX, barY, barWidth * percent, barHeight, 10);
    ctx.fillStyle = '#ff2e2e';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`${xp}/${requiredXP} EXP`, width / 2, barY - 10);

    // === ЛЕВАЯ СТАТИСТИКА ===
    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';

    ctx.fillText(`Сообщений: ${userData.messages}`, 80, 180);
    ctx.fillText(`В топе: 1000+`, 80, 230);
    ctx.fillText(`Онлайн: ${userData.voiceTime} ч`, 80, 280);

    // === ПРАВАЯ ===
    ctx.fillText(`Монеты: ${userData.coins}`, 660, 200);
    ctx.fillText(`Алмазы: ${userData.diamonds}`, 660, 250);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });

    await interaction.reply({ files: [attachment] });
  }
};
