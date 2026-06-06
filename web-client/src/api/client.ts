import type {
    User,
    Course,
    CourseDetails,
    Review,
    SignUpData,
    SignInData,
    ApiResponse,
} from "./types";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
        const errorObj = "error" in error ? error.error : error;
        const msg = errorObj
            ? "message" in errorObj
                ? errorObj.message
                : errorObj.error
            : "Unknown error";

        throw new Error(msg);
    }

    return response.json();
}

export const authApi = {
    me: () => fetchApi<ApiResponse<User>>("/auth/me"),

    signUp: (data: SignUpData) =>
        fetchApi<ApiResponse>("/auth/sign-up", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    signIn: (data: SignInData) =>
        fetchApi<ApiResponse>("/auth/sign-in", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    signOut: () =>
        fetchApi<ApiResponse>("/auth/sign-out", {
            method: "POST",
        }),
};

export const coursesApi = {
    getAll: () => fetchApi<Course[]>("/courses"),

    getById: (id: string) => fetchApi<CourseDetails>(`/courses/${id}`),

    subscribe: (id: string) =>
        fetchApi(`/courses/${id}/subscribe`, {
            method: "POST",
        }),

    completeChapter: (courseId: string, chapterId: string) =>
        fetchApi(`/courses/${courseId}/chapters/${chapterId}/complete`, {
            method: "POST",
        }),
};

export const reviewsApi = {
    getByCourseId: (courseId: string) =>
        fetchApi<ApiResponse<Review[]>>(`/reviews/${courseId}`),

    create: (data: { courseId: string; rating: number; comment: string }) =>
        fetchApi<ApiResponse<Review>>("/reviews", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
