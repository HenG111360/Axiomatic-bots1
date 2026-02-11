const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder().setName("roles").setDescription("Nan").
        addSubcommand(subcommand => subcommand.setName("all").setDescription("Get all roles available in server"))
        .addSubcommand(subcommand => subcommand.setName("create").setDescription("Give Name to your created role").addStringOption(option =>
            option.setName("name").setDescription("Give your role a name").setRequired(true)
        ).addBooleanOption(option => option.setName("hoisted").setDescription("Display role members separately from online members").setRequired(true)).addStringOption(option => option.setName("color").setDescription("Choose the color you want to give in Hexcode "))
        )
        .addSubcommand(subcommand => subcommand.setName("add").setDescription("Add roles to member").addUserOption(option => option.setName("user").setDescription("Select User you want to vie role").setRequired(true)).
            addRoleOption(option => option.setName("role").setDescription("Select role you want to give").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("remove").setDescription("remove role of user you want").addUserOption(option => option.setName("user").setDescription("Select User you want to vie role").setRequired(true)).
            addRoleOption(option => option.setName("role").setDescription("Select role you want to give").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("info").setDescription("Get info of role").
            addRoleOption(option => option.setName("role").setDescription("Which role info you want ?").setRequired(true))),

    async execute(interaction) {
        const { options } = interaction
        const subcommand = options.getSubcommand()

        switch (subcommand) {
            case "all":
                const rolemap = interaction.guild.roles.cache

                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)){
                    const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Roles permission to use this command**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }
                if (rolemap) {

                    const exampleEmbed = new EmbedBuilder().setTitle(`${interaction.guild.name} Roles`).setDescription(
                        `${rolemap.map(role => `${role}\n`).join(" ")}`
                    )
                    await interaction.reply({ embeds: [exampleEmbed] })
                }

                else {
                    const exampleEmbed = new EmbedBuilder().setTitle(`${interaction.guild.name} Roles`).setDescription("No roles found")
                    await interaction.reply({ embeds: [exampleEmbed] })
                }
                break

            case "create":
                var reg = /^#([0-9a-f]{3}){1,2}$/i;
                const name = options.getString("name")
                const color = options.getString("color")
                const hoist = options.getBoolean("hoisted")

                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)){
                    const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Roles permission to use this command**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }
                let colorpure = null
                if (color) {
                    const check = reg.test(color)
                    if (check) {
                        colorpure = color
                    }
                }

                const roleinfo = await interaction.guild.roles.create(
                    {
                        name: name,
                        color: colorpure,
                        hoist: hoist
                    }
                )
                const exampleEmbed = new EmbedBuilder().setDescription(`**Created Role ${name}**`).setFooter({ text: "If wrong Hex color was provided , color will be switched to default" })
                interaction.reply({ embeds: [exampleEmbed] })
                break

            case "add":
                const jiskodenahai = options.getMember("user")
                const role = options.getRole("role")
                const requestUserRolePosition = interaction.member.roles.highest.position;
                const botRolePosition = interaction.guild.members.me.roles.highest.position;

                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)){
                    const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Roles permission to use this command**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }

                if (role.position >= botRolePosition) {
                    const exampleEmbed = new EmbedBuilder().setDescription("**I can't do this I need a more higher role**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }

                else {
                    jiskodenahai.roles.add(role)
                    const exampleEmbed = new EmbedBuilder().setDescription(`Given <@&${role.id}> Role to ${jiskodenahai.user.username}`).setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );

                }
                break

            case "remove":

                const member = options.getMember("user")
                const role1 = options.getRole("role")
                const requestUserRolePosition1 = interaction.member.roles.highest.position;
                const botRolePosition1 = interaction.guild.members.me.roles.highest.position;

                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)){
                    const exampleEmbed = new EmbedBuilder().setDescription("**You Dont have Manage Roles permission to use this command**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }

                if (role1.position >= requestUserRolePosition1) {
                    const exampleEmbed = new EmbedBuilder().setDescription("**You can't Remove this role You need More higher role.**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }

                if (role1.position >= botRolePosition1) {
                    const exampleEmbed = new EmbedBuilder().setDescription("**I can't do this I need a more higher role**").setColor("Blue")
                    await interaction.reply(
                        { embeds: [exampleEmbed] }
                    );
                    return;
                }

                else {
                    if (member.roles.cache.some(role => role.id === role1.id)) {
                        member.roles.remove(role1)
                        const exampleEmbed = new EmbedBuilder().setDescription(`Removed <@&${role1.id}> Role from ${member.user.username}`).setColor("Blue")
                        await interaction.reply(
                            { embeds: [exampleEmbed] }
                        );

                    }

                    else {
                        const exampleEmbed = new EmbedBuilder().setDescription(`${member.user.username} dont have <@&${role1.id}> Role `).setColor("Blue")
                        await interaction.reply(
                            { embeds: [exampleEmbed] }
                        );

                    }
                }
                break
            case "info":
                const roleinfoto = options.getRole("role")
                const rolepure = roleinfoto.permissions.toArray()
                const exampleEmbed1 = new EmbedBuilder().setDescription(`${rolepure.map(role => `${role}\n`).join(" ")}`).setColor("Blue")
                await interaction.reply(
                    { embeds: [exampleEmbed1] }
                );
                break
        }
    }
}