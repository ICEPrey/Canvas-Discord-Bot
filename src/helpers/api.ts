import axios, { AxiosRequestConfig } from "axios";
import { getCanvasToken } from "./supabase";
import {
  AnnouncementPost,
  Course,
  Assignment,
  DiscussionTopic,
} from "../types";
import { CONFIG } from "../config";

function buildCanvasUrl(endpoint: string): string {
  return `${CONFIG.CANVAS_DOMAIN}/api/v1/${endpoint}`;
}

export async function fetchData<T>(
  userId: string,
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  config: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const canvasToken = await getCanvasToken(userId);
    if (!canvasToken) {
      throw new Error("Canvas token is not found.");
    }

    const url = `${CONFIG.CANVAS_DOMAIN}${endpoint}`;
    const response = await axios.get<T>(url, {
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${canvasToken}`,
        "Content-Type": "application/json",
      },
      params,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Axios error fetching data from ${endpoint}:`,
        error.message,
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error(`Unexpected error fetching data from ${endpoint}:`, error);
    }
    throw error;
  }
}

export async function fetchAssignments(
  courseId: number,
  userId: string,
): Promise<{ message: string; assignments: Assignment[] }> {
  try {
    const url = buildCanvasUrl(`courses/${courseId}/assignments`);
    const assignments = await fetchData<Assignment[]>(userId, url);
    return {
      message: "Assignments fetched successfully",
      assignments: assignments,
    };
  } catch (error) {
    console.error(`Error fetching assignments for course ${courseId}:`, error);
    return {
      message: "Failed to fetch assignments",
      assignments: [],
    };
  }
}

export async function getAllAssignments(
  userId: string,
): Promise<{ message: string; courses: Course[] }> {
  try {
    const courses = await fetchData<Course[]>(
      userId,
      "users/self/missing_submissions",
      {
        include: "planner_overrides",
        filter: "current_grading_period_id,submittable",
      },
    );
    return {
      message: "Missing submissions fetched successfully",
      courses: courses,
    };
  } catch (error) {
    console.error("Failed to fetch missing submissions:", error);
    return {
      message: "Failed to fetch missing submissions",
      courses: [],
    };
  }
}

export async function getCourses(userId: string): Promise<Course[]> {
  try {
    const url = buildCanvasUrl("courses");
    return await fetchData<Course[]>(userId, url);
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses");
  }
}

export async function getAllAnnouncements(
  userId: string,
): Promise<AnnouncementPost[]> {
  try {
    const url = buildCanvasUrl("announcements");
    return await fetchData<AnnouncementPost[]>(userId, url);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw new Error("Failed to fetch announcements");
  }
}

export async function fetchAssignmentChecker(
  userId: string,
): Promise<Assignment[]> {
  try {
    const courses = await getCourses(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const assignmentPromises = courses.map((course) =>
      fetchData<Assignment[]>(
        userId,
        buildCanvasUrl(`courses/${course.id}/assignments`),
      ),
    );

    const allAssignments = await Promise.all(assignmentPromises);

    return allAssignments.flat().filter((assignment) => {
      const dueDate = new Date(assignment.due_at);
      return dueDate >= today && dueDate <= tomorrow;
    });
  } catch (error) {
    console.error("Error fetching assignments for next day:", error);
    return [];
  }
}

export async function getDiscussions(
  userId: string,
  courseId: number,
): Promise<DiscussionTopic[]> {
  try {
    const url = buildCanvasUrl(`courses/${courseId}/discussion_topics`);
    return await fetchData<DiscussionTopic[]>(userId, url);
  } catch (error) {
    console.error(`Failed to fetch discussions for course ${courseId}:`, error);
    throw new Error("Error fetching discussions");
  }
}

export async function fetchMissingAssignments(
  userId: string,
): Promise<Assignment[]> {
  try {
    const courses = await getCourses(userId);
    const assignmentPromises = courses.map((course) =>
      fetchData<Assignment[]>(
        userId,
        buildCanvasUrl(`courses/${course.id}/assignments`),
      ),
    );

    const allAssignments = await Promise.all(assignmentPromises);

    return allAssignments.flat().filter((assignment) => {
      const dueDate = new Date(assignment.due_at);
      return dueDate < new Date() && !assignment.has_submitted_submissions;
    });
  } catch (error) {
    console.error("Error fetching missing assignments:", error);
    throw new Error("Failed to fetch missing assignments");
  }
}
