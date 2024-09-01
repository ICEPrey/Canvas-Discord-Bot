import { EmbedBuilder, Client } from "discord.js";
import { randomColor } from "../helpers/colors";
import { Assignment } from "../types";

export async function postAssignment(
  userId: string,
  assignment: Assignment,
  client: Client,
): Promise<void> {
  const {
    name: title,
    html_url: url,
    points_possible: points,
    due_at,
    is_quiz_assignment,
    has_submitted_submissions,
  } = assignment;
  const dueDate = new Date(due_at).toLocaleDateString("en-US");
  const isQuiz = is_quiz_assignment ? "**Yes**" : "**No**";
  const isDone = has_submitted_submissions ? ":white_check_mark:" : ":x:";
  const allowedAttempts =
    assignment.allowed_attempts === -1
      ? "Unlimited"
      : assignment.allowed_attempts.toString();

  const embed = new EmbedBuilder()
    .setColor(randomColor())
    .setTitle(title)
    .setURL(url)
    .addFields(
      { name: "Due Date", value: dueDate, inline: true },
      { name: "Allowed Attempts", value: allowedAttempts, inline: true },
      { name: "Total Points", value: points.toString(), inline: true },
      { name: "Is This A Quiz", value: isQuiz, inline: true },
      { name: "Submitted", value: isDone },
    )
    .setTimestamp()
    .setFooter({ text: "Next Canvas check in 24 hours." });

  try {
    await client.users.send(userId, { embeds: [embed] });
    console.log(`Sent assignment to user ${userId}`);
  } catch (error) {
    console.error(`Error sending assignment to user ${userId}:`, error);
  }
}
