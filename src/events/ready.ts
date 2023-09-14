import { Client, Events, ActivityType } from "discord.js";
import { runCanvasCheckTimer } from "./announcements";
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`Up! Logged In As ${client?.user?.tag}`);
        client?.user?.setActivity("Your Assignments", {
            type: ActivityType.Watching,
        });
        runCanvasCheckTimer(client);
    },
};
