import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Select a member and kick them.")
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The member to kick")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for kicking"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction: any) {
        const target = interaction.options.getUser("target");
        const reason =
            interaction.options.getString("reason") ?? "No reason provided";

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm Kick")
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `Are you sure you want to kick ${target.username} for reason: ${reason}?`,
            components: [row],
        });
        const collectorFilter = (index: { user: { id: number } }) =>
            index.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000,
            });
            if (confirmation.customId === "confirm") {
                await interaction.guild.members.kick(target);
                await confirmation.update({
                    content: `<@${target.id}> has been kicked for reason: ${reason}`,
                    components: [],
                });
            } else if (confirmation.customId === "cancel") {
                await confirmation.update({
                    content: "Action cancelled",
                    components: [],
                });
            }
        } catch {
            await interaction.editReply({
                content:
                    "Confirmation not received within 1 minute, cancelling",
                components: [],
            });
        }
    },
};
