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
  posted_at?: string | Date;
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

export interface DiscussionPermissions {
  attach: boolean;
  update: boolean;
  reply: boolean;
  delete: boolean;
  manage_assign_to: boolean;
  require_initial_post: boolean | null;
  user_can_see_posts: boolean;
}

export interface DiscussionAssignment {
  id: number;
  description: string;
  due_at: Date;
  unlock_at: Date;
  lock_at: Date;
  points_possible: number;
  grading_type: string;
  assignment_group_id: number;
  grading_standard_id: number | null;
  created_at: Date;
  updated_at: Date;
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  position: number;
  grade_group_students_individually: boolean;
  anonymous_peer_reviews: boolean;
  group_category_id: number | null;
  post_to_sis: boolean;
  moderated_grading: boolean;
  omit_from_final_grade: boolean;
  intra_group_peer_reviews: boolean;
  anonymous_instructor_annotations: boolean;
  anonymous_grading: boolean;
  graders_anonymous_to_graders: boolean;
  grader_count: number;
  grader_comments_visible_to_graders: boolean;
  final_grader_id: number | null;
  grader_names_visible_to_final_grader: boolean;
  allowed_attempts: number;
  annotatable_attachment_id: number | null;
  hide_in_gradebook: boolean;
  secure_params: string;
  lti_context_id: string;
  course_id: number;
  name: string;
  submission_types: string[];
  has_submitted_submissions: boolean;
  due_date_required: boolean;
  max_name_length: number;
  in_closed_grading_period: boolean;
  graded_submissions_exist: boolean;
  is_quiz_assignment: boolean;
  can_duplicate: boolean;
  original_course_id: number | null;
  original_assignment_id: number | null;
  original_lti_resource_link_id: number | null;
  original_assignment_name: string | null;
  original_quiz_id: number | null;
  workflow_state: string;
  important_dates: boolean;
  muted: boolean;
  html_url: string;
  published: boolean;
  only_visible_to_overrides: boolean;
  visible_to_everyone: boolean;
  locked_for_user: boolean;
  submissions_download_url: string;
  post_manually: boolean;
  anonymize_students: boolean;
  require_lockdown_browser: boolean;
  restrict_quantitative_data: boolean;
  todo_date: string | null;
  is_announcement: boolean;
}

export interface DiscussionTopic extends DataItem {
  title: string;
  last_reply_at: Date | null;
  created_at: Date;
  delayed_post_at: Date | null;
  posted_at: Date;
  assignment_id: number;
  root_topic_id: number | null;
  position: number | null;
  podcast_has_student_posts: boolean;
  discussion_type: string;
  lock_at: Date | null;
  allow_rating: boolean;
  only_graders_can_rate: boolean;
  sort_by_rating: boolean;
  is_section_specific: boolean;
  anonymous_state: string | null;
  summary_enabled: boolean;
  user_name: string | null;
  discussion_subentry_count: number;
  permissions: DiscussionPermissions;
  read_state: string;
  unread_count: number;
  subscribed: boolean;
  attachments: File[];
  published: boolean;
  can_unpublish: boolean;
  locked: boolean;
  can_lock: boolean;
  comments_disabled: boolean;
  author: string[];
  html_url: string;
  url: string;
  pinned: boolean;
  group_category_id: number | null;
  can_group: boolean;
  topic_children: string[];
  group_topic_children: string[];
  locked_for_user: boolean;
  message: string;
  assignment: DiscussionAssignment;
}
