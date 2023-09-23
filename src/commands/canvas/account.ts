import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";
import { AcessToken, getCanvasToken } from "../../helpers/supabase";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("account")
        .setDescription("Set an access token to use the /assignment command")
        .addStringOption((option: any) =>
            option
                .setName("token")
                .setDescription("The canvas access token")
                .setRequired(true),
        )
        .setDMPermission(false),
    async execute(interaction: any) {
        try {
            const userId = interaction.user.id;
            const token = interaction.options.getString("token");
            const existingToken = await getCanvasToken(userId);
            if (existingToken || null) {
                await interaction.reply({
                    ephemeral: true,
                    content:
                        "You already have a Canvas token stored. If you want to update it, please contact support.",
                });
                return;
            }
            const confirm = new ButtonBuilder()
                .setCustomId("confirm")
                .setLabel("Submit Token")
                .setStyle(ButtonStyle.Success);

            const cancel = new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(cancel, confirm);

            const response = await interaction.reply({
                ephemeral: true,
                content: `Are you sure you want to submit this token ${token} ?`,
                components: [row],
            });
            const collectorFilter = (index: { user: { id: number } }) =>
                index.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 60_000,
                    ephemeral: true,
                });
                if (confirmation.customId === "confirm") {
                    await AcessToken(token, interaction.user.id);
                    await confirmation.update({
                        content:
                            "Token has been successfully saved to the database ",
                        components: [],
                        ephemeral: true,
                    });
                } else if (confirmation.customId === "cancel") {
                    await confirmation.update({
                        content: "Action cancelled",
                        ephemeral: true,
                        components: [],
                    });
                }
            } catch (error) {
                console.error("Confirmation error:", error);
                await interaction.editReply({
                    content:
                        "Confirmation not received within 1 minute, cancelling",
                    components: [],
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("Command execution error:", error);
            await interaction.reply({
                content: "An error occurred while executing the command.",
                ephemeral: true,
            });
        }
    },
};
