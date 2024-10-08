import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  Collection,
  MessageComponentInteraction,
  TextChannel,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { fetchAssignments, getCourses } from "../../helpers/api";
import { Course } from "../../types";

export const data = new SlashCommandBuilder()
  .setName("assignments")
  .setDescription("Display assignments for your courses");

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const courses = await getCourses(userId);

  if (courses.length === 0) {
    await interaction.reply({
      content: "You have no courses.",
      ephemeral: true,
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("course_select")
    .setPlaceholder("Select a course")
    .addOptions(
      courses.map((course: Course) => ({
        label: course.name,
        value: course.id.toString(),
      })),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.reply({
    content: "Please select a course:",
    components: [row],
    ephemeral: true,
  });

  if (
    !interaction.channel ||
    !("createMessageComponentCollector" in interaction.channel)
  ) {
    throw new Error("Invalid channel for component collector");
  }

  const collector = (
    interaction.channel as TextChannel
  ).createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
  });

  collector.on("collect", async (i: StringSelectMenuInteraction) => {
    const courseId = i.values[0];
    const assignmentsResponse = await fetchAssignments(
      parseInt(courseId),
      userId,
    );

    const upcomingAssignments = assignmentsResponse.assignments.filter(
      (assignment: { due_at: string }) =>
        new Date(assignment.due_at) > new Date(),
    );

    if (upcomingAssignments.length > 0) {
      const embed = new EmbedBuilder()
        .setColor(randomColor())
        .setTitle("📚 Upcoming Assignments")
        .setDescription(
          "Here are the upcoming assignments for the selected course:",
        )
        .addFields(
          upcomingAssignments.map(
            (assignment: {
              name: string;
              due_at: string;
              html_url: string;
            }) => ({
              name: `${assignment.name}`,
              value: `Due: ${new Date(assignment.due_at).toLocaleString()} \n[${
                assignment.name
              }](${assignment.html_url})`,
              inline: false,
            }),
          ),
        )
        .setFooter({
          text: "Canvas By Instructure",
          iconURL:
            "https://play-lh.googleusercontent.com/2_M-EEPXb2xTMQSTZpSUefHR3TjgOCsawM3pjVG47jI-BrHoXGhKBpdEHeLElT95060B=w240-h480-rw",
        });

      await i.update({ embeds: [embed], components: [] });
    } else {
      await i.update({
        content: "There are no upcoming assignments for this course.",
        components: [],
      });
    }
  });

  collector.on(
    "end",
    async (collected: Collection<string, MessageComponentInteraction>) => {
      if (collected.size === 0) {
        await interaction.followUp({
          content: "No course was selected.",
          ephemeral: true,
        });
      }
    },
  );
}
