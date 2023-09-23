import axios from "axios";
import { convert } from "html-to-text";
import { EmbedBuilder } from "discord.js";
import { randomColor } from "../helpers/colors";
import { fetchUser, getCanvasToken } from "../helpers/supabase";

interface AnnouncementPost {
    author?: {
        display_name?: string;
        avatar_image_url?: string;
        html_url?: string;
    };
    message?: string;
    title?: string;
    html_url?: string;
    postLink?: string;
}

export async function runCanvasCheckTimer(client: any) {
    const sentAnnouncementIds = new Set();
    try {
        const userData = await fetchUser();
        for (const user of userData) {
            const canvasToken = await getCanvasToken(user.discord_user);
            const announcements = await getAllAnnouncements(canvasToken);
            if (announcements.length > 0) {
                announcements.forEach(
                    (announcement: {
                        id: string;
                        title: string;
                        user_display_name: string;
                        message: string;
                    }) => {
                        if (!sentAnnouncementIds.has(announcement.id)) {
                            postAnnouncement(
                                user.discord_user,
                                announcement,
                                client,
                            );
                            sentAnnouncementIds.add(announcement.id);
                        }
                    },
                );
            }
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

async function getAllAnnouncements(canvasToken: string) {
    try {
        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}announcements?context_codes[]=course_27088`,
            {
                headers: {
                    Authorization: `Bearer ${canvasToken}`,
                },
            },
        );
        return res.data;
    } catch (error) {
        console.error("Error fetching announcements:", error.message);
        throw error;
    }
}

async function postAnnouncement(
    userId: string,
    post: AnnouncementPost,
    client: any,
) {
    const title = post.title || "No Title";
    const author = post.author?.display_name || "Unknown Author";
    const message = convert(post.message || "", {});
    const avatar_image_url = post.author?.avatar_image_url || "";
    const html_url = post.author?.html_url || "";
    const postLink = post.html_url || "";
    try {
        const embed = new EmbedBuilder()
            .setColor(randomColor)
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
        client.users.send(userId.toString(), { embeds: [embed] });
        console.log(`Sent DM to user ${userId}`);
    } catch (error) {
        console.error(`Error sending DM to user ${userId}:`, error);
    }
}
