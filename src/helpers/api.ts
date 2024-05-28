import axios, { AxiosError } from "axios";
import { getCanvasID, getCanvasToken } from "./supabase";

interface FetchDataResponse {
    data: any;
}

interface CourseResponse {
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

export async function fetchData(
    url: string,
    token: string,
    params: Record<string, unknown> = {},
): Promise<FetchDataResponse> {
    try {
        const response = await axios.get<FetchDataResponse>(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            params,
        });
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                `Axios error fetching data from ${url}:`,
                error.message,
            );
        } else {
            console.error(`Unexpected error fetching data from ${url}:`, error);
        }
        throw error;
    }
}

export async function fetchCourses(userId: string): Promise<CourseResponse> {
    const canvasToken = await getCanvasToken(userId);
    if (!canvasToken) {
        return {
            message:
                "You are not enrolled in any courses; Please enter your token with the command /account",
            courses: [],
        };
    }
    try {
        const response = await axios.get<CourseResponse>(
            `${process.env.CANVAS_DOMAIN}courses`,
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
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Axios error fetching user's courses from Canvas:",
                error.message,
            );
        } else {
            console.error(
                "Unexpected error fetching user's courses from Canvas:",
                error,
            );
        }
        return {
            message: "An error occurred while fetching courses.",
            courses: [],
        };
    }
}

export async function fetchAssignments(
    courseId: number,
    userId: string,
): Promise<any[]> {
    const canvasToken = await getCanvasToken(userId);
    try {
        const response = await axios.get<any[]>(
            `${process.env.CANVAS_DOMAIN}courses/${courseId}/assignments`,
            {
                headers: {
                    Authorization: `Bearer ${canvasToken}`,
                    "Content-Type": "application/json",
                },
            },
        );
        console.log(
            "Assignments fetched successfully for course ID:",
            courseId,
        );
        return response.data || [];
    } catch (error: unknown) {
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

        const res = await axios.get(
            `${process.env.CANVAS_DOMAIN}users/self/missing_submissions?include[]=planner_overrides&filter[]=current_grading_period&filter[]=submittable`,
            { headers, params },
        );

        const courses = res.data;

        return {
            message: "Missing Courses fetched successfully",
            courses: courses || [],
        };
    } catch (error) {
        console.error(
            "Error fetching user's missing courses from Canvas:",
            error.message,
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
): Promise<any[]> {
    try {
        const canvasID = await getCanvasID(userID);
        const response = await axios.get(
            `${process.env.CANVAS_DOMAIN}users/${canvasID}/courses`,
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

        for (let course of courses) {
            try {
                const response = await axios.get(
                    `${process.env.CANVAS_DOMAIN}announcements?context_codes[]=course_${course.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${canvasToken}`,
                        },
                    },
                );

                const filteredAnnouncements = response.data.filter(
                    (announcement: any) => {
                        const announcementDate = new Date(
                            announcement.posted_at,
                        );
                        return announcementDate >= today;
                    },
                );

                allAnnouncements = allAnnouncements.concat(
                    filteredAnnouncements,
                );
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

export async function fetchAssignmentChecker(userId: string): Promise<any[]> {
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

    let allAssignments: any[] = [];

    await Promise.all(
        courses.map(async (course) => {
            const { data: assignments } = await axios.get(
                `${process.env.CANVAS_DOMAIN}courses/${course.id}/assignments`,
                {
                    headers: {
                        Authorization: `Bearer ${canvasToken}`,
                    },
                },
            );

            const filteredAssignments = assignments.filter(
                (assignment: any) => {
                    const dueDate = new Date(assignment.due_at);
                    return dueDate >= today && dueDate <= tomorrow;
                },
            );

            allAssignments = allAssignments.concat(filteredAssignments);
        }),
    );

    return allAssignments;
}
