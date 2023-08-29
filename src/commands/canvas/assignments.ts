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
async function GetCalendar() {
    try {
        const res = await axios.get(
            "https://cypresscollege.instructure.com/api/v1/calendar_events?type=assignment&context_codes%5B%5D=user_107534&context_codes%5B%5D=course_26775&context_codes%5B%5D=course_27088&context_codes%5B%5D=course_27371&context_codes%5B%5D=course_26621&context_codes%5B%5D=course_27466&start_date=2023-07-30T07%3A00%3A00.000Z&end_date=2023-09-03T07%3A00%3A00.000Z&per_page=50",
            {
                headers: {
                    "Authorization": `Bearer ${process.env.ACCESS}`,
                    "Content-Type": "application/json",
                },
            },
        );

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
            } as const; // Use "as const" to assert the type of options

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
                // Check if the user ID matches the original interaction's user ID
                if (i.user.id !== interaction.user.id) {
                    // Acknowledge the interaction but don't do anything
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
