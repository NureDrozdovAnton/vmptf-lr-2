export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    reviews: Review[];
    isSubscribed?: boolean;
    progress?: {
        total: number;
        completed: number;
        percentage: number;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: string;
    courseId: string;
    title: string;
    description: string;
    image: string;
    progress?: {
        startedAt: string;
        completedAt: string | null;
        isCompleted: boolean;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    courseId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CourseDetails extends Course {
    chapters: Chapter[];
}

export interface SignUpData {
    email: string;
    password: string;
    name: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface ApiResponse<T = null> {
    ok: boolean;
    data?: T;
    error?: string;
    user?: User | null;
}
