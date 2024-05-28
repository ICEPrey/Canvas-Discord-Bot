import {
    SlashCommandBuilder,
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
    execute: (...arguments_) => void;
}

declare global {
    namespace NodeJS {
        interface ProcessEnvironment {
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

export interface FetchDataResponse {
    data: any;
}

export interface CourseResponse {
    message: string;
    courses: any[];
}

export interface AnnouncementPost {
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

export interface MissingAssignmentResponse {
    message: string;
    courses: any[];
}
