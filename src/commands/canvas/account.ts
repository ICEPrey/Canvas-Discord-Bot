import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
    codeBlock,
    ChatInputCommandInteraction,
    ActionRowData,
    MessageActionRowComponentData,
} from "discord.js";
import { AccessToken, getCanvasToken } from "../../helpers/supabase";
import axios from "axios";
import { Command } from "../../types";
async function getCanvasID(canvasToken: string) {
    try {
        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}users/self?ns=com.trypronto.canvas-app`,
            {
                headers: {
                    Authorization: `Bearer ${canvasToken}`,
                },
            },
        );
        return res.data;
    } catch (error) {
        console.error("Error getting canvas user id:", error.message);
        throw new Error("Failed to get Canvas ID");
    }
}

async function chooseSchool(
    interaction: ChatInputCommandInteraction,
    schools: { name: string; id: { toString: () => string }; domain: string }[],
) {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("school_select")
        .setPlaceholder("Select a school")
        .addOptions(
            schools.map(
                (school: { name: string; id: { toString: () => string } }) => ({
                    label: school.name,
                    value: school.id.toString(),
                }),
            ),
        );

    const row: ActionRowData<MessageActionRowComponentData> =
        new ActionRowBuilder()
            .addComponents(selectMenu)
            .toJSON() as ActionRowData<MessageActionRowComponentData>;

    try {
        await interaction.editReply({
            content: "Please select your college: ",
            components: [row],
        });
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
        });
        return new Promise((resolve) => {
            if (collector) {
                collector.on("collect", async (index: { values: any[] }) => {
                    const selectedOption = schools.find(
                        (school) => school.id.toString() === index.values[0],
                    );

                    if (selectedOption !== undefined) {
                        await interaction.editReply({
                            content: `You have entered the college name: ${selectedOption.name}`,
                            components: [],
                        });
                        resolve(selectedOption);
                    } else {
                        await interaction.followUp({
                            content:
                                "Invalid input. Please enter a valid college name.",
                            components: [],
                            ephemeral: true,
                        });
                        resolve("DefaultCollegeName");
                    }
                });
            } else {
                console.error("Interaction channel is null.");
            }
        });
    } catch (error) {
        if (error.code === "InteractionTimedOut") {
            await interaction.editReply({
                content: "School selection timed out. Please try again.",
                components: [],
            });
        }
    }
}
export const data = new SlashCommandBuilder()
    .setName("account")
    .setDescription("Set an access token to use the /assignment command")
    .addStringOption((option) =>
        option
            .setName("token")
            .setDescription("The canvas access token")
            .setRequired(true),
    )
    .setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const data: Command["data"] = {
            name: "account",
            permissions: [],
            aliases: [],
        };
        const userId: any = interaction.user.id;
        const token = interaction?.options?.getString("token") || "";
        const existingToken = await getCanvasToken(userId);
        if (existingToken !== null) {
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
        const row: ActionRowData<MessageActionRowComponentData> =
            new ActionRowBuilder()
                .addComponents(cancel, confirm)
                .toJSON() as ActionRowData<MessageActionRowComponentData>;

        const response = await interaction.reply({
            ephemeral: true,
            content: `Are you sure you want to submit this token: \n${codeBlock(
                "fix",
                token,
            )}`,
            components: [row],
        });
        const collectorFilter = (index: {
            user: {
                id: string;
            };
        }): boolean => {
            return index.user.id === interaction.user.id;
        };

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60000,
            });
            if (confirmation.customId === "confirm") {
                const schoolSearchUrl = `https://canvas.instructure.com/api/v1/accounts/search?name=long beach&per_page=5`;
                const schoolResponse = await axios.get(schoolSearchUrl);
                const schools = schoolResponse.data;
                const selectedSchool = await chooseSchool(interaction, schools);
                console.log(selectedSchool);
                const canvasId = await getCanvasID(token);
                await AccessToken(
                    token,
                    interaction.user.id,
                    canvasId.id,
                    selectedSchool,
                );
                await interaction.followUp({
                    content:
                        "Token has been successfully saved to the database",
                    ephemeral: true,
                });
            } else if (confirmation.customId === "cancel") {
                await confirmation.update({
                    content: "Action cancelled",
                    components: [],
                });
            }
            return { data };
        } catch (error) {
            console.error("Confirmation error:", error);
            await interaction.editReply({
                content:
                    "Confirmation not received within 1 minute, cancelling",
                components: [],
            });
        }
    } catch (error) {
        console.error("Command execution error:", error);
        await interaction.reply({
            content: "An error occurred while executing the command.",
            ephemeral: true,
        });
    }
}
