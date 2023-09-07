import axios from "axios";
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} from "discord.js";
import { colors } from "../../helpers/colors";
import { supabase } from "../../helpers/client";

const randomColor = colors[Math.floor(Math.random() * colors.length)];
async function getCanvasToken(userId: number) {
    try {
        const { data } = await supabase
            .from("canvas")
            .select("token")
            .eq("discord_user", userId)
            .single();

        return data ? data.token : null;
    } catch (error) {
        console.error("Error fetching Canvas token from the database:", error);
        throw error;
    }
}
async function getUserCourses(userId: number) {
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
    } catch (error: any) {
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
async function getAssignmentsForCourse(courseId: number, userId: number) {
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
    } catch (error: any) {
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assignments")
        .setDescription("Display assignments for your courses"),
    async execute(interaction: any) {
        try {
            const userId = interaction.user.id;
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

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: "Please select a course:",
                components: [row],
                ephemeral: true,
            });

            const collector =
                interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    time: 3_600_000,
                });

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
                    const assignmentList = upcomingAssignments
                        .map(
                            (assignment: {
                                due_at: string | number | Date;
                                name: any;
                            }) => {
                                const dueDate = new Date(assignment.due_at);
                                const formattedDueDate =
                                    dueDate.toLocaleString();

                                return `${assignment.name} (Due: ${formattedDueDate})`;
                            },
                        )
                        .join("\n");

                    await interaction.editReply({
                        content: `Assignments for the selected course:\n${assignmentList}`,
                        ephemeral: true,
                    });
                }
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while fetching courses.",
                ephemeral: true,
            });
        }
    },
};
