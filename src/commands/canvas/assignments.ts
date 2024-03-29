import axios from "axios";
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
    EmbedBuilder,
    ActionRowData,
    ActionRowComponent,
    InteractionReplyOptions,
    ChatInputCommandInteraction,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { getCanvasToken } from "../../helpers/supabase";
import { Command } from "../../types";

async function getUserCourses(userId: string) {
    try {
        const canvasToken = await getCanvasToken(userId);
        if (!canvasToken) {
            return {
                message:
                    "You are not enrolled in any courses; Please enter your token with the command /account",
                courses: [],
            };
        }
        const res = await axios.get(`${process.env.CANVAS_DOMAIN}courses`, {
            headers: {
                "Authorization": `Bearer ${canvasToken}`,
                "Content-Type": "application/json",
            },
            params: {
                "enrollment_type": "student",
                "enrollment_state": "active",
                "user_id": userId,
            },
        });

        const courses = res.data;

        return {
            message: "Courses fetched successfully",
            courses: courses || [],
        };
    } catch (error) {
        console.error(
            "Error fetching user's courses from Canvas:",
            error.message,
        );
        return {
            message: "An error occurred while fetching courses.",
            courses: [],
        };
    }
}
async function getAssignmentsForCourse(courseId: number, userId: string) {
    try {
        const canvasToken = await getCanvasToken(userId);
        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}courses/${courseId}/assignments`,
            {
                headers: {
                    "Authorization": `Bearer ${canvasToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const assignments = res.data;
        console.log(
            "Assignments fetched successfully for course ID:",
            courseId,
        );
        return assignments || [];
    } catch (error) {
        console.error(
            "Error fetching assignments for the course:",
            error.message,
        );
        console.error(
            "Error occurred while fetching assignments for course ID:",
            courseId,
        );
        return [];
    }
}
export const data = new SlashCommandBuilder()
    .setName("assignments")
    .setDescription("Display assignments for your courses");
export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const data: Command["data"] = {
            name: "assignments",
            permissions: [],
            aliases: [],
        };
        const userId: any = interaction.user.id;
        const userCoursesResult = await getUserCourses(userId);
        const userCourses = userCoursesResult.courses;

        if (userCourses.length === 0) {
            await interaction.reply({
                content: userCoursesResult.message,
                ephemeral: true,
            });
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("course_select")
            .setPlaceholder("Select a course")
            .addOptions(
                userCourses.map((course: any) => ({
                    label: course.name,
                    value: course.id.toString(),
                })),
            );

        const row = new ActionRowBuilder()
            .addComponents(selectMenu)
            .toJSON() as ActionRowData<ActionRowComponent>;

        await interaction.reply({
            content: "Please select a course:",
            components: [row],
            ephemeral: true,
        } as InteractionReplyOptions);

        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
        });

        if (collector) {
            collector.on("collect", async (index: { values: any[] }) => {
                const selection = index.values[0];
                const assignments = await getAssignmentsForCourse(
                    selection,
                    interaction.user.id,
                );
                const currentDate = new Date();
                const upcomingAssignments = assignments.filter(
                    (assignment: { due_at: string | number | Date }) => {
                        const dueDate = new Date(assignment.due_at);
                        return dueDate >= currentDate;
                    },
                );

                if (upcomingAssignments.length > 0) {
                    const embed = new EmbedBuilder()
                        .setColor(randomColor)
                        .setTitle("Upcoming Assignments")
                        .setDescription("Assignments for the selected course:")
                        .addFields(
                            upcomingAssignments.map(
                                (assignment: {
                                    name: string;
                                    due_at: string | number | Date;
                                }) => ({
                                    name: assignment.name,
                                    value: `Due: ${new Date(
                                        assignment.due_at,
                                    ).toLocaleString()}`,
                                }),
                            ),
                        )
                        .setFooter({
                            iconURL:
                                "https://play-lh.googleusercontent.com/2_M-EEPXb2xTMQSTZpSUefHR3TjgOCsawM3pjVG47jI-BrHoXGhKBpdEHeLElT95060B=w240-h480-rw",
                            text: "Canvas By Instructure",
                        });
                    interaction.followUp({
                        embeds: [embed],
                        ephemeral: true,
                    });
                } else {
                    interaction.followUp({
                        content:
                            "There are no upcoming assignments for this course.",
                        ephemeral: true,
                    });
                }
            });
        } else {
            console.error("Interaction channel is null.");
        }
        return { data };
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "An error occurred while fetching courses.",
            ephemeral: true,
        });
    }
}
