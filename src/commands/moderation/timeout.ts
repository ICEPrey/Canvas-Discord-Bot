import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Select a member and timeout them.")
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The member to timeout")
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName("seconds")
                .setDescription("Timeout in seconds")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for timeout"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction: any) {
        const target = interaction.options.getUser("target");
        const reason =
            interaction.options.getString("reason") ?? "No reason provided";
        const time = interaction.options.getInteger("seconds");
        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm Timeout")
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `Are you sure you want to timeout ${target.username} for reason: ${reason}?`,
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
                const member = interaction.options.getMember("target");
                await member.timeout(time);
                await confirmation.update({
                    content: `<@${target.id}> has been timeout for reason: ${reason}`,
                    components: [],
                });
            } else if (confirmation.customId === "cancel") {
                await confirmation.update({
                    content: "Action cancelled",
                    components: [],
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: `${error} Confirmation not received within 1 minute, cancelling`,
                components: [],
            });
        }
    },
};
