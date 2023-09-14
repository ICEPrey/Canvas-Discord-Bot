import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { supabase } from "../helpers/client";
import { randomColor } from "../helpers/colors";

const assignmentsEndpoint = `${process.env.CANVAS_DOMAIN}courses/27088/assignments`;

export async function runAssignmentChecker(client: any) {
    const sentAssignmentIds = new Set();

    try {
        const userData = await fetchUser();

        for (const user of userData) {
            const assignments = await getAllAssignments();

            if (assignments.length > 0) {
                assignments.forEach((assignment: any) => {
                    if (!sentAssignmentIds.has(assignment.id)) {
                        postAssignment(user.discord_user, assignment, client);
                        sentAssignmentIds.add(assignment.id);
                    }
                });
            }
        }

        console.log("Canvas assignments checked successfully.");
    } catch (error) {
        console.error("Error fetching and posting assignments:", error);
    } finally {
        setTimeout(() => {
            runAssignmentChecker(client);
            console.log("Next Canvas assignment check in 24 hours.");
        }, 24 * 60 * 60 * 1000);
    }
}

async function fetchUser() {
    try {
        const { data, error } = await supabase.from("canvas").select("*");

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error fetching user data from the database:", error);
        throw error;
    }
}

async function getAllAssignments() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        const res = await axios.get(assignmentsEndpoint, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS}`,
            },
        });

        const assignments = res.data;

        const filteredAssignments = assignments.filter((assignment: any) => {
            const dueDate = new Date(assignment.due_at);

            return dueDate >= today && dueDate <= tomorrow;
        });

        return filteredAssignments;
    } catch (error) {
        console.error("Error fetching assignments:", error.message);
        throw error;
    }
}

async function postAssignment(userId: string, post: any, client: any) {
    const title = post["name"];
    const url = post["html_url"];
    const points = post["points_possible"];
    const dueDate = new Date(post["due_at"]).toLocaleDateString("en-US");
    const isQuiz = post["is_quiz_assignment"] === true ? "**Yes**" : "**No**";
    const isDone =
        post["has_submitted_submissions"] === true
            ? ":white_check_mark:"
            : ":x:";
    try {
        const allowedAttempts =
            post["allowed_attempts"] === -1
                ? "Unlimited"
                : post["allowed_attempts"];

        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle(title)
            .setURL(url)
            .addFields(
                { name: "Due Date", value: `${dueDate}`, inline: true },
                {
                    name: "Allowed Attempts",
                    value: `${allowedAttempts}`,
                    inline: true,
                },
                { name: "Total Points", value: points, inline: true },
                { name: "Is This A Quiz", value: isQuiz, inline: true },
                { name: "Submitted", value: isDone },
            )
            .setTimestamp()
            .setFooter({ text: "Next Canvas check in 24 hours." });

        await client.users.send(userId.toString(), { embeds: [embed] });
        console.log(`Sent assignment to user ${userId}`);
    } catch (error) {
        console.error(`Error sending assignment to user ${userId}:`, error);
    }
}
