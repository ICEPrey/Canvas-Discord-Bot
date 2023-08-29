import supabase from "../../helpers/client";
const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");

async function AcessToken(token, user) {
    try {
        const { error } = await supabase.supabase
            .from("canvas")
            .insert({ token: token, discord_user: user });

        if (error) {
            throw new Error("Error inserting token into the database");
        }
    } catch (error) {
        console.error("Error inserting token into the database:", error);
        throw error;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("account")
        .setDescription("Set an access token to use the /assignment command")
        .addStringOption((option) =>
            option
                .setName("token")
                .setDescription("The canvas access token")
                .setRequired(true),
        )
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const token = interaction.options.getString("token");
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
            const collectorFilter = (i) => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 60000,
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
            } catch (e) {
                console.error("Confirmation error:", e);
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
