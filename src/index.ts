import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const client: Client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const foldersPath = join(__dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter((file) =>
        file.endsWith(".js"),
    );
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
            );
        }
    }
}

const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith(".js") && file !== "helpers.js",
);
for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...arguments_) =>
            event.execute(...arguments_),
        );
    } else {
        client.on(event.name, (...arguments_) => event.execute(...arguments_));
    }
}

client.login(process.env.TOKEN);
