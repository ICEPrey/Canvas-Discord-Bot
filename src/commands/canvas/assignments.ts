import { supabase } from "../../helpers/client";

const { default: axios } = require("axios");
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require("discord.js");
const colors = [
    "Default",
    "White",
    "Aqua",
    "Green",
    "Blue",
    "Yellow",
    "Purple",
    "LuminousVividPink",
    "Fuchsia",
    "Gold",
    "Orange",
    "Red",
    "Grey",
    "Navy",
    "DarkAqua",
    "DarkGreen",
    "DarkBlue",
    "DarkPurple",
    "DarkVividPink",
    "DarkGold",
    "DarkOrange",
    "DarkRed",
    "DarkGrey",
    "DarkerGrey",
    "LightGrey",
    "DarkNavy",
    "Blurple",
    "Greyple",
    "DarkButNotBlack",
    "NotQuiteBlack",
];

const randomColor = colors[Math.floor(Math.random() * colors.length)];

async function ReadToken(user: number) {
    try {
        const { data: discordUser, error } = await supabase
            .from("canvas")
            .select("discord_user")
            .match({ discord_user: user });

        if (error) {
            throw new Error("Error fetching token from the database");
        }

        return discordUser || null;
    } catch (error) {
        console.error("Error fetching token from the database:", error);
        throw error;
    }
}

async function GetCalendar() {
    try {
        const res = await axios.get(process.env.CANVAS_DOMAIN, {
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS}`,
                "Content-Type": "application/json",
            },
        });

        const events = res.data;
        const assignments = events.filter(
            (event: { type: string }) => event.type === "assignment",
        );
        return assignments;
    } catch (error) {
        console.error("Error fetching calendar data:", error.message);
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assignments")
        .setDescription(
            "These are all the assignments in your course with an upcoming due date:",
        ),
    async execute(interaction: any) {
        try {
            await ReadToken(interaction.user.id);
            const assignments = await GetCalendar();
            let currentIndex = 0;
            const dueDate = new Date(assignments[currentIndex].start_at);
            const options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            } as const;

            const formattedDueDate = dueDate.toLocaleString("en-US", options);

            const embed = new EmbedBuilder()
                .setColor(randomColor)
                .setTitle(assignments[currentIndex].title)
                .setDescription(`Due at: ${formattedDueDate}`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("previous")
                    .setLabel("Previous")
                    .setStyle("Primary"),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next")
                    .setStyle("Primary"),
            );

            await interaction.reply({ embeds: [embed], components: [row] });

            const filter = (i: {
                user: { id: number };
                reply: (arg0: { content: string; ephemeral: boolean }) => void;
                deferUpdate: () => void;
                customId: string;
            }) => {
                if (i.user.id !== interaction.user.id) {
                    i.reply({
                        content: "You are not authorized to use these buttons.",
                        ephemeral: true,
                    });
                    return false;
                }

                i.deferUpdate();
                return i.customId === "previous" || i.customId === "next";
            };

            const collector =
                interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

            collector.on(
                "collect",
                async (i: {
                    customId: string;
                    message: { edit: (arg0: { embeds: any[] }) => any };
                }) => {
                    if (i.customId === "previous") {
                        if (currentIndex > 0) currentIndex--;
                    } else if (i.customId === "next") {
                        if (currentIndex < assignments.length - 1)
                            currentIndex++;
                    }

                    const dueDate = new Date(
                        assignments[currentIndex].start_at,
                    );
                    const formattedDueDate = dueDate.toLocaleString(
                        "en-US",
                        options,
                    );

                    const updatedEmbed = new EmbedBuilder()
                        .setColor(randomColor)
                        .setTitle(assignments[currentIndex].title)
                        .setDescription(`Due at: ${formattedDueDate}`);

                    await i.message.edit({ embeds: [updatedEmbed] });
                },
            );

            collector.on("end", () => {
                const cancelRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("cancel")
                        .setLabel("Cancel")
                        .setStyle("Danger"),
                );
                interaction.editReply({ components: [cancelRow] });
            });
        } catch (error) {
            console.error(error);
            await interaction.reply(
                "An error occurred while fetching assignments.",
            );
        }
    },
};
