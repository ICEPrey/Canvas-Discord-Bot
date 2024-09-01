import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { Assignment, Command, MissingAssignmentResponse } from "../../types";
import { getAllAssignments } from "../../helpers/api";

export const data = new SlashCommandBuilder()
  .setName("missing")
  .setDescription("Find which missing assignments are due")
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const commandData: Command["data"] = {
      name: "missing",
      permissions: [],
      aliases: [],
    };
    const userId: string = interaction.user.id;
    const userAssignments: MissingAssignmentResponse = await getAllAssignments(
      userId,
    );

    if (userAssignments.courses.length === 0) {
      await interaction.reply({
        content: "You have no missing assignments.",
        ephemeral: true,
      });
      return;
    }

    for (const course of userAssignments.courses as Assignment[]) {
      const title: string = course.name;
      const url: string = course.html_url;
      const points: number = course.points_possible;
      const dueDate: string = new Date(course.due_at).toLocaleDateString(
        "en-US",
      );
      const isQuiz: string = course.is_quiz_assignment ? "**Yes**" : "**No**";

      const embed = new EmbedBuilder()
        .setColor(randomColor())
        .setTitle(title)
        .setURL(url)
        .addFields(
          {
            name: "Due Date",
            value: dueDate,
            inline: true,
          },
          {
            name: "Total Points",
            value: points.toString(),
            inline: true,
          },
          {
            name: "Is This A Quiz",
            value: isQuiz,
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
    }
    await interaction.reply("Missing assignments received in DM's");
    return { data: commandData };
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
}
