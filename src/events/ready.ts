import { Client, Events, ActivityType } from "discord.js";
import { AnnouncementPost, Assignment, BotEvent } from "../types";
import { postAnnouncement } from "./announcements";
import { runChecker } from "../helpers/checker";
import { getCanvasToken } from "../helpers/supabase";
import { fetchAssignmentChecker, getAllAnnouncements } from "../helpers/api";
import { postAssignment } from "./assignmentChecker";
import logger from "../logger";

const clientReadyEvent: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    logger.info({ user: client.user?.tag }, "Bot is ready");
    console.log(`Up! Logged In As ${client?.user?.tag}`);
    client?.user?.setActivity("Your Assignments", {
      type: ActivityType.Watching,
    });
    runChecker<AnnouncementPost>(
      client,
      async (userId) => {
        const token = await getCanvasToken(userId);
        if (token) {
          return getAllAnnouncements(userId);
        } else {
          throw new Error("Failed to retrieve Canvas token.");
        }
      },
      postAnnouncement,
      "Canvas announcements checked successfully.",
      "Error fetching and posting announcements:",
      24 * 60 * 60 * 1000,
    );

    runChecker<Assignment>(
      client,
      (userId) => fetchAssignmentChecker(userId),
      postAssignment,
      "Canvas assignments checked successfully.",
      "Error fetching and posting assignments:",
      24 * 60 * 60 * 1000,
    );
  },
};

export = clientReadyEvent;
