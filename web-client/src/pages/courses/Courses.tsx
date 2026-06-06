import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, coursesApi, type Course } from "~/api";

const Courses: FC = () => {
    const navigate = useNavigate();
    const { data: me } = useQuery({
        queryKey: ["me"],
        queryFn: authApi.me,
    });
    const {
        data: courses,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["courses"],
        queryFn: coursesApi.getAll,
    });

    const calculateAverageRating = (course: Course): number => {
        if (!course.reviews || course.reviews.length === 0) return 0;
        const total = course.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );
        return Math.round((total / course.reviews.length) * 10) / 10;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">
                    Error loading courses: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Courses
                    </h1>
                    {me.user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 font-medium">
                                {me.user.name}
                            </span>
                            <button
                                onClick={() => {
                                    authApi.signOut().then(() => {
                                        navigate("/sign-in");
                                    });
                                }}
                                className="px-4 py-2 hover:text-white rounded-lg hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <button
                                onClick={() => navigate("/sign-in")}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/sign-up")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses?.map((course) => {
                        const rating = calculateAverageRating(course);
                        return (
                            <div
                                key={course.id}
                                onClick={() =>
                                    navigate(`/courses/${course.id}`)
                                }
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                            >
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                        {course.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-yellow-400 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">
                                                {rating > 0
                                                    ? rating.toFixed(1)
                                                    : "No ratings"}
                                            </span>
                                            {rating > 0 && (
                                                <span className="text-gray-500 text-sm ml-1">
                                                    ({course.reviews.length})
                                                </span>
                                            )}
                                        </div>
                                        {course.isSubscribed &&
                                            course.progress && (
                                                <div className="text-sm text-gray-600">
                                                    {course.progress.percentage}
                                                    % complete
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Courses;
