import axios from "axios";
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
    EmbedBuilder,
    InteractionReplyOptions,
    ChatInputCommandInteraction,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { fetchAssignments, fetchCourses } from "../../helpers/api";

export const data = new SlashCommandBuilder()
    .setName("assignments")
    .setDescription("Display assignments for your courses");

export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const { message, courses } = await fetchCourses(userId);

    if (courses.length === 0) {
        await interaction.reply({ content: message, ephemeral: true });
        return;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("course_select")
        .setPlaceholder("Select a course")
        .addOptions(
            courses.map((course: { name: string; id: number }) => ({
                label: course.name,
                value: course.id.toString(),
            })),
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: "Please select a course:",
        components: [row.toJSON()],
        ephemeral: true,
    } as InteractionReplyOptions);

    const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
    });

    collector?.on("collect", async (i) => {
        const courseId = i.values[0];
        const assignments = await fetchAssignments(parseInt(courseId), userId);
        const upcomingAssignments = assignments.filter(
            (assignment: { due_at: string }) =>
                new Date(assignment.due_at) > new Date(),
        );

        if (upcomingAssignments.length > 0) {
            const embed = new EmbedBuilder()
                .setColor(randomColor())
                .setTitle("Upcoming Assignments")
                .setDescription(
                    "Here are the upcoming assignments for the selected course:",
                )
                .addFields(
                    upcomingAssignments.map(
                        (assignment: { name: string; due_at: string }) => ({
                            name: assignment.name,
                            value: `Due: ${new Date(
                                assignment.due_at,
                            ).toLocaleString()}`,
                        }),
                    ),
                )
                .setFooter({
                    text: "Canvas By Instructure",
                    iconURL:
                        "https://play-lh.googleusercontent.com/2_M-EEPXb2xTMQSTZpSUefHR3TjgOCsawM3pjVG47jI-BrHoXGhKBpdEHeLElT95060B=w240-h480-rw",
                });
            await i.update({ embeds: [embed] });
        } else {
            await i.update({
                content: "There are no upcoming assignments for this course.",
            });
        }
    });
    collector?.on("end", async (collected) => {
        if (collected.size === 0) {
            await interaction.followUp({
                content: "No course was selected.",
                ephemeral: true,
            });
        }
    });
}
