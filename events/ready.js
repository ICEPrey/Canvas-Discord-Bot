const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Up! Logged In As ${client.user.tag}`);
        client.user.setAvatar(
            "https://media.discordapp.net/attachments/304032321076592643/1145231096603226112/0039201edit.png?width=1010&height=671",
        );
        client.user.setActivity("Watching habibi server", {
            type: ActivityType.Watching,
        });
    },
};
