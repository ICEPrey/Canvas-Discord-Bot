import { Client, Events, ActivityType } from "discord.js";
import { BotEvent } from "../types";
import { runCanvasCheckTimer } from "./announcements";
import { runAssignmentChecker } from "./assignmentChecker";

const clientReadyEvent: BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`Up! Logged In As ${client?.user?.tag}`);
        client?.user?.setActivity("Your Assignments", {
            type: ActivityType.Watching,
        });
        runCanvasCheckTimer(client);
        runAssignmentChecker(client);
    },
};

export = clientReadyEvent;
