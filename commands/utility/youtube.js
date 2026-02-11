const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const yt = require("../../schema/ytschema")
const Parser = require('rss-parser')
let parser = new Parser();


module.exports = {
    data: new SlashCommandBuilder().setName("youtube").setDescription("Nan").addSubcommand(
        subcommand => subcommand.setName("add").setDescription("add youtube channel to get notification on upload").addStringOption(option => option.setName("ytchannelid").setDescription("Enter Youtube channel id ").setRequired(true)).addChannelOption(option => option.setName("channel").setDescription("Where you want to send notification").setRequired(true)).addRoleOption(option => option.setName("role").setDescription("role you want to ping").setRequired(true))
    ),
    async execute(interaction) {
        const { options } = interaction
        const ytid = options.getString("ytchannelid")
        const role = options.getRole("role")
        const channel = options.getChannel("channel")


        const check = await yt.findOne({ ytid: ytid })


        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Ban permission to use this command**").setColor("Blue")
            await interaction.reply(
                { embeds: [exampleEmbed] }
            );
            return;

        }

        if (check) {
            const exampleEmbed = new EmbedBuilder().setDescription("Channel already Exist in my List")
            interaction.reply({ embeds: [exampleEmbed] })
        }

        else {
            const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytid}`)

            if (!feed) {
                const exampleEmbed = new EmbedBuilder().setDescription("This channel dont have any video ro Channel id is wrong please atleast upload a single video to use this feature")
                interaction.reply({ embeds: [exampleEmbed] })
                return;
            }

            else {
                await yt.insertOne({
                    ytid: ytid,
                    roleid: role.id,
                    guildid: interaction.guild.id,
                    channelid: channel.id,
                    latestid: feed.items[0].id
                })
                const exampleEmbed = new EmbedBuilder().setDescription("Done")
                interaction.reply({ embeds: [exampleEmbed] })
                return;
            }
        }
    }
}
