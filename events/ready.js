const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Up! Logged In As ${client.user.tag}`);
        client.user.setActivity("Watching habibi server", {
            type: ActivityType.Watching,
        });
    },
};
