import { convert } from "html-to-text";
import { EmbedBuilder, Client } from "discord.js";
import { randomColor } from "../helpers/colors";
import { fetchUser, getCanvasToken } from "../helpers/supabase";
import { AnnouncementPost, getAllAnnouncements } from "../helpers/api";

export async function runCanvasCheckTimer(client: Client) {
    const sentAnnouncementIds = new Set<string>();
    try {
        const userData = await fetchUser();
        for (const user of userData) {
            if (!user.discord_user) continue;

            const canvasToken = await getCanvasToken(user.discord_user);
            if (!canvasToken) continue;

            const announcements = await getAllAnnouncements(
                canvasToken,
                user.discord_user,
            );
            announcements.forEach((announcement) => {
                if (
                    announcement.postLink &&
                    sentAnnouncementIds.has(announcement.postLink)
                )
                    return;

                if (announcement.postLink) {
                    postAnnouncement(user.discord_user, announcement, client);
                    sentAnnouncementIds.add(announcement.postLink);
                }
            });
        }
        console.log("Canvas announcements checked successfully.");
    } catch (error) {
        console.error("Error fetching and posting announcements:", error);
    } finally {
        setTimeout(() => {
            runCanvasCheckTimer(client);
            console.log("Next Canvas check in 24 hours.");
        }, 24 * 60 * 60 * 1000);
    }
}

async function postAnnouncement(
    userId: string,
    post: AnnouncementPost,
    client: Client,
) {
    const title = post.title || "No Title";
    const author = post.author?.display_name || "Unknown Author";
    const message = convert(post.message || "", {});
    const avatar_image_url = post.author?.avatar_image_url || "";
    const html_url = post.author?.html_url || "";
    const postLink = post.html_url || "";
    try {
        const embed = new EmbedBuilder()
            .setColor(randomColor())
            .setTitle(title)
            .setDescription(`${message}`)
            .setURL(postLink)
            .setAuthor({
                name: author,
                iconURL: avatar_image_url,
                url: html_url,
            })
            .setFooter({ text: "Next Canvas check in 24 hours." })
            .setTimestamp();
        await client.users.send(userId.toString(), { embeds: [embed] });
        console.log(`Sent DM to user ${userId}`);
    } catch (error) {
        console.error(`Error sending DM to user ${userId}:`, error);
    }
}
