import axios, { AxiosRequestConfig } from "axios";
import { getCanvasID, getCanvasToken } from "./supabase";
import {
  AnnouncementPost,
  Course,
  Assignment,
  DiscussionTopic,
} from "../types";
import { CONFIG } from "../config";

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
    const response = await axios.get<T>(`${CONFIG.CANVAS_DOMAIN}${endpoint}`, {
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
      );
    } else {
      console.error(`Unexpected error fetching data from ${endpoint}:`, error);
    }
    throw error;
  }
}

export async function fetchCourses(userId: string) {
  try {
    const canvasID = await getCanvasID(userId);
    const courses = await fetchData<Course[]>(
      userId,
      `users/${canvasID}/courses`,
      {
        enrollment_type: "student",
        enrollment_state: "active",
      },
    );
    return courses;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw new Error("Error fetching courses.");
  }
}

export async function fetchAssignments(
  courseId: number,
  userId: string,
): Promise<{ message: string; assignments: Assignment[] }> {
  try {
    const assignments = await fetchData<Assignment[]>(
      userId,
      `courses/${courseId}/assignments`,
    );
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
    const canvasID = await getCanvasID(userId);
    return await fetchData<Course[]>(userId, `users/${canvasID}/courses`);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw new Error("Error fetching courses.");
  }
}

export async function getAllAnnouncements(
  userId: string,
): Promise<AnnouncementPost[]> {
  try {
    const courses = await getCourses(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allAnnouncements: AnnouncementPost[] = [];

    for (const course of courses) {
      try {
        const announcements = await fetchData<AnnouncementPost[]>(
          userId,
          "announcements",
          { context_codes: `course_${course.id}` },
        );

        const filteredAnnouncements = announcements
          .filter((announcement) => {
            const announcementDate = new Date(announcement.posted_at || "");
            return announcementDate >= today;
          })
          .map((announcement) => ({
            ...announcement,
            id:
              announcement.id ||
              `${announcement.title}-${announcement.posted_at}`,
          }));

        allAnnouncements = allAnnouncements.concat(filteredAnnouncements);
      } catch (error) {
        console.error(
          `Failed to fetch announcements for course ${course.id}:`,
          error,
        );
      }
    }

    return allAnnouncements;
  } catch (error) {
    console.error("Failed to fetch all announcements:", error);
    throw new Error("Error fetching all announcements.");
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
      fetchData<Assignment[]>(userId, `courses/${course.id}/assignments`),
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
    const discussions = await fetchData<DiscussionTopic[]>(
      userId,
      `courses/${courseId}/discussion_topics`,
    );
    return discussions;
  } catch (error) {
    console.error(`Failed to fetch discussions for course ${courseId}:`, error);
    throw new Error("Error fetching discussions.");
  }
}
