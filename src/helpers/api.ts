import axios, { AxiosError } from "axios";
import { getCanvasToken } from "./supabase";

interface FetchDataResponse {
    data: any;
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

interface CourseResponse {
    message: string;
    courses: any[];
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
