import { convert } from "html-to-text";
import { EmbedBuilder, Client } from "discord.js";
import { randomColor } from "../helpers/colors";
import { AnnouncementPost } from "../types";

export async function postAnnouncement(
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
