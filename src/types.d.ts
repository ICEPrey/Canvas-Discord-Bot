import {
  SlashCommandBuilder,
  Collection,
  PermissionResolvable,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";

export interface SlashCommand {
  command:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  cooldown?: number;
}

export interface Command {
  data: {
    name: string;
    permissions: PermissionResolvable[];
    aliases: string[];
    cooldown?: number;
  };
  execute: (interaction: Interaction) => Promise<void>;
}

interface GuildOptions {
  prefix: string;
}

export type GuildOption = keyof GuildOptions;

export interface BotEvent {
  name: string;
  once?: boolean;
  execute: (...args) => Promise<void>;
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

export interface FetchDataResponse<T> {
  data: T;
}

export interface CourseResponse {
  message: string;
  courses: Course[];
}

export interface AnnouncementPost extends DataItem {
  author?: {
    display_name?: string;
    avatar_image_url?: string;
    html_url?: string;
  };
  message?: string;
  title?: string;
  html_url?: string;
  postLink?: string;
  posted_at?: string;
}

export interface MissingAssignmentResponse {
  message: string;
  courses: Course[];
}

export interface Assignment extends DataItem {
  name: string;
  html_url: string;
  points_possible: number;
  due_at: string;
  is_quiz_assignment: boolean;
  has_submitted_submissions: boolean;
  allowed_attempts: number;
}

export interface Course extends DataItem {
  name: string;
}

export interface CanvasUser {
  discord_user: string;
  token: string;
  canvas_id: number;
  school: string;
  school_domain: string;
}

export interface SelectedSchool {
  name: string;
  domain: string;
}

export interface DataItem {
  id: number | string;
}
