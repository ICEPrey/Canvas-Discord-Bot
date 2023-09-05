import axios from "axios";
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} from "discord.js";
import { colors } from "../../helpers/colors";

const randomColor = colors[Math.floor(Math.random() * colors.length)];

async function getUserCourses(user: number) {
    try {
        const res = await axios.get(`${process.env.CANVAS_DOMAIN}courses`, {
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS}`,
                "Content-Type": "application/json",
            },
            params: {
                "enrollment_type": "student",
                "enrollment_state": "active",
                "user_id": user,
            },
        });

        const courses = res.data;

        return courses || [];
    } catch (error: any) {
        console.error(
            "Error fetching user's courses from Canvas:",
            error.message,
        );
        return [];
    }
}

async function getAssignmentsForCourse(courseId: number) {
    try {
        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}courses/${courseId}/assignments`,
            {
                headers: {
                    "Authorization": `Bearer ${process.env.ACCESS}`,
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
            const userCourses = await getUserCourses(interaction.user.id);

            if (userCourses.length === 0) {
                await interaction.reply({
                    content:
                        "You are not enrolled in any courses; Please enter your token with the command /account",
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

            const response = await interaction.reply({
                content: "Please select a course:",
                components: [row],
                ephemeral: true,
            });

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 3_600_000,
            });

            collector.on(
                "collect",
                async (index: { values: { [0]: number } }) => {
                    const selection = index.values[0];
                    const assignments = await getAssignmentsForCourse(
                        selection,
                    );

                    const assignmentList = assignments
                        .map((assignment: any) => {
                            const dueDate = new Date(assignment.due_at);
                            const formattedDueDate = dueDate.toLocaleString();

                            return `${assignment.name} (Due: ${formattedDueDate})`;
                        })
                        .join("\n");

                    await interaction.editReply({
                        content: `Assignments for the selected course:\n${assignmentList}`,
                        ephemeral: true,
                    });
                },
            );
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while fetching courses.",
                ephemeral: true,
            });
        }
    },
};
