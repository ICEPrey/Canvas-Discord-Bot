import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { randomColor } from "../../helpers/colors";
import { getCanvasToken } from "../../helpers/supabase";
const AUTH_HEADER = "Authorization";
const CONTENT_TYPE_HEADER = "Content-Type";

async function getAllAssignments(
    userId: number,
): Promise<{ message: string; courses: any }> {
    try {
        const canvasToken = await getCanvasToken(userId);
        if (!canvasToken) {
            return {
                message:
                    "You are not enrolled in any courses; Please enter your token with the command /account",
                courses: [],
            };
        }

        const headers = {
            [AUTH_HEADER]: `Bearer ${canvasToken}`,
            [CONTENT_TYPE_HEADER]: "application/json",
        };

        const params = {
            enrollment_type: "student",
            enrollment_state: "active",
            user_id: userId,
        };

        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}users/self/missing_submissions?include%5B%5D=planner_overrides&filter%5B%5D=current_grading_period&filter%5B%5D=submittable`,
            { headers, params },
        );

        const courses = res.data;

        return {
            message: "Missing Courses fetched successfully",
            courses: courses || [],
        };
    } catch (error) {
        console.error(
            "Error fetching user's missing courses from Canvas:",
            error.message,
        );
        return {
            message: "An error occurred while fetching courses.",
            courses: [],
        };
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("missing")
        .setDescription("Find which missing assignments are due")
        .setDMPermission(false),
    async execute(interaction: any) {
        try {
            const userId = interaction.user.id;
            const userAssignments = await getAllAssignments(userId);

            if (userAssignments.courses.length === 0) {
                await interaction.reply({
                    content: "You have no missing assignments.",
                    ephemeral: true,
                });
                return;
            }

            for (const post of userAssignments.courses) {
                const title = post["name"];
                const url = post["html_url"];
                const points = post["points_possible"];
                const dueDate = new Date(post["due_at"]).toLocaleDateString(
                    "en-US",
                );
                const isQuiz =
                    post["is_quiz_assignment"] === true ? "**Yes**" : "**No**";

                const embed = new EmbedBuilder()
                    .setColor(randomColor)
                    .setTitle(title)
                    .setURL(url)
                    .addFields(
                        {
                            name: "Due Date",
                            value: dueDate.toString(),
                            inline: true,
                        },
                        {
                            name: "Total Points",
                            value: points.toString(),
                            inline: true,
                        },
                        {
                            name: "Is This A Quiz",
                            value: isQuiz.toString(),
                            inline: true,
                        },
                    )
                    .setTimestamp()
                    .setFooter({
                        iconURL:
                            "https://play-lh.googleusercontent.com/2_M-EEPXb2xTMQSTZpSUefHR3TjgOCsawM3pjVG47jI-BrHoXGhKBpdEHeLElT95060B=w240-h480-rw",
                        text: "Canvas By Instructure",
                    });
                await interaction.user.send({ embeds: [embed] });
                await interaction.reply(
                    "Missing assignements recieved in DM's",
                );
            }
        } catch (error) {
            console.error(
                "An error occurred while fetching or replying to missing assignments: ",
                error,
            );
            await interaction.reply({
                content:
                    "An error occurred while fetching or replying to missing assignments.",
                ephemeral: true,
            });
        }
    },
};
