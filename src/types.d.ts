import {
    SlashCommandBuilder,
    CommandInteraction,
    Collection,
    PermissionResolvable,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Interaction,
} from "discord.js";

export interface SlashCommand {
    command: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => void;
    autocomplete?: (interaction: AutocompleteInteraction) => void;
    cooldown?: number;
}

export interface Command {
    data: {
        name: string;
        permissions: Array<PermissionResolvable>;
        aliases: Array<string>;
        cooldown?: number;
    };
    execute: (interaction: Interaction) => void;
}

interface GuildOptions {
    prefix: string;
}

export type GuildOption = keyof GuildOptions;
export interface BotEvent {
    name: string;
    once?: boolean | false;
    execute: (...args) => void;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            ACCESS: string;
            SUPABASE_URL: string;
            SUPABASE_ANON: string;
            GUILD_ID: string;
            CANVAS_DOMAIN: string;
        }
    }
}

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
        commands: Collection<string, Command>;
        cooldowns: Collection<string, number>;
    }
}
