import axios from "axios";
import { getCanvasID, getCanvasToken } from "./supabase";
import {
  MissingAssignmentResponse,
  AnnouncementPost,
  Course,
  Assignment,
} from "../types";
import { CONFIG } from "../config";

export async function fetchData<T>(
  url: string,
  token: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  try {
    const response = await axios.get<T>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching data from ${url}:`, error.message);
    } else {
      console.error(`Unexpected error fetching data from ${url}:`, error);
    }
    throw error;
  }
}

export async function fetchCourses(
  userId: string,
): Promise<{ message: string; courses: Course[] }> {
  const canvasToken = await getCanvasToken(userId);
  if (!canvasToken) {
    return {
      message:
        "You are not enrolled in any courses; Please enter your token with the command /account",
      courses: [],
    };
  }
  try {
    const response = await axios.get<{ courses: Course[] }>(
      `${CONFIG.CANVAS_DOMAIN}courses`,
      {
        headers: {
          Authorization: `Bearer ${canvasToken}`,
          "Content-Type": "application/json",
        },
        params: {
          enrollment_type: "student",
          enrollment_state: "active",
          user_id: userId,
        },
      },
    );
    return {
      message: "Courses fetched successfully",
      courses: response.data.courses || [],
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      message: "An error occurred while fetching courses.",
      courses: [],
    };
  }
}

export async function fetchAssignments(
  courseId: number,
  userId: string,
): Promise<Assignment[]> {
  const canvasToken = await getCanvasToken(userId);
  try {
    const response = await axios.get<Assignment[]>(
      `${CONFIG.CANVAS_DOMAIN}courses/${courseId}/assignments`,
      {
        headers: {
          Authorization: `Bearer ${canvasToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Assignments fetched successfully for course ID:", courseId);
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching assignments for the course:",
        error.message,
      );
    } else {
      console.error(
        "Unexpected error fetching assignments for the course:",
        error,
      );
    }
    return [];
  }
}

export async function getAllAssignments(
  userId: string,
): Promise<MissingAssignmentResponse> {
  try {
    const canvasToken = await getCanvasToken(userId);
    if (!canvasToken) {
      return {
        message:
          "You are not enrolled in any courses; Please enter your token with the command /account",
        courses: [],
      };
    }

    const headers = {
      Authorization: `Bearer ${canvasToken}`,
      "Content-Type": "application/json",
    };

    const params = {
      enrollment_type: "student",
      enrollment_state: "active",
      user_id: userId,
    };

    const res = await axios.get<Course[]>(
      `${CONFIG.CANVAS_DOMAIN}users/self/missing_submissions?include[]=planner_overrides&filter[]=current_grading_period&filter[]=submittable`,
      { headers, params },
    );

    return {
      message: "Missing Courses fetched successfully",
      courses: res.data || [],
    };
  } catch (error) {
    console.error(
      "Error fetching user's missing courses from Canvas:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      message: "An error occurred while fetching courses.",
      courses: [],
    };
  }
}

export async function getCourses(
  canvasToken: string,
  userID: string,
): Promise<Course[]> {
  try {
    const canvasID = await getCanvasID(userID);
    const response = await axios.get<Course[]>(
      `${CONFIG.CANVAS_DOMAIN}users/${canvasID}/courses`,
      {
        headers: {
          Authorization: `Bearer ${canvasToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw new Error("Error fetching courses.");
  }
}

export async function getAllAnnouncements(
  canvasToken: string,
  userID: string,
): Promise<AnnouncementPost[]> {
  try {
    const courses = await getCourses(canvasToken, userID);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allAnnouncements: AnnouncementPost[] = [];

    for (const course of courses) {
      try {
        const response = await axios.get<AnnouncementPost[]>(
          `${CONFIG.CANVAS_DOMAIN}announcements?context_codes[]=course_${course.id}`,
          {
            headers: {
              Authorization: `Bearer ${canvasToken}`,
            },
          },
        );

        const filteredAnnouncements = response.data
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
  const canvasToken = await getCanvasToken(userId);
  if (!canvasToken) {
    throw new Error("Canvas token is null or undefined.");
  }
  const courses = await getCourses(canvasToken, userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  let allAssignments: Assignment[] = [];

  await Promise.all(
    courses.map(async (course) => {
      const { data: assignments } = await axios.get<Assignment[]>(
        `${CONFIG.CANVAS_DOMAIN}courses/${course.id}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${canvasToken}`,
          },
        },
      );

      const filteredAssignments = assignments.filter((assignment) => {
        const dueDate = new Date(assignment.due_at);
        return dueDate >= today && dueDate <= tomorrow;
      });

      allAssignments = allAssignments.concat(filteredAssignments);
    }),
  );

  return allAssignments;
}
