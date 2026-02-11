# Honami - A Feature-Rich Discord Bot

Honami is a powerful Discord bot built using **discord.js**. It includes **music, moderation, giveaways, and AFK commands**, making it an all-in-one solution for your server.

## Features
✅ **Music System** (YouTube & Spotify support)  
✅ **Moderation Commands** (Ban, Kick, Mute, etc.)  
✅ **Giveaway System** (Start, end, and manage giveaways)  
✅ **AFK System** (Set your AFK status and get notified)  
✅ **Easy Setup** (Just add your bot token in `config.json` and run!)  

## Installation
### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Discord Developer Account](https://discord.com/developers/applications) (To create a bot token)

### Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/honami.git
   cd honami
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Add your **bot token** to `config.json`:
   ```json
   {
       "token": "YOUR_BOT_TOKEN_HERE"
   }
   ```
4. Start the bot:
   ```sh
   node index.js
   ```

## Commands
### 🎵 **Music Commands**
- `/play <song>` - Plays a song from YouTube or Spotify.
- `/pause` - Pauses the current song.
- `/resume` - Resumes playback.
- `/skip` - Skips the current track.
- `/queue` - Shows the queue.
- `/stop` - Stops playback and clears the queue.

### ⚔ **Moderation Commands**
- `/ban @user` - Bans a user.
- `/kick @user` - Kicks a user.
- `/mute @user` - Mutes a user.
- `/unmute @user` - Unmutes a user.
- `/purge <amount>` - Deletes messages in bulk.

### 🎉 **Giveaway Commands**
- `/gstart <duration> <winners> <prize>` - Starts a giveaway.
- `/gend <giveaway_id>` - Ends a giveaway.
- `/greroll <giveaway_id>` - Rerolls a giveaway winner.

### 🌙 **AFK Commands**
- `/afk <reason>` - Sets your AFK status.
- When mentioned, users will be notified that you're AFK.

## Hosting
You can host the bot on:
- **VPS/Dedicated Server** (Recommended for 24/7 uptime)
- **Replit** (For free hosting but with limitations)
- **Heroku** (For simple deployment)

## Future Improvements
- Adding more fun commands
- Slash command support for better UX
- Dashboard for bot configuration

## License
This project is licensed under the MIT License.

## Contributors
Feel free to contribute! Fork the repository and submit a pull request.

---
**Author:** [adityarawat1223]  


