import type { FC } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { coursesApi, reviewsApi, authApi } from "~/api";

const Course: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"chapters" | "reviews">("chapters");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ["course", id],
        queryFn: () => coursesApi.getById(id!),
        enabled: !!id,
    });

    const { data: userResponse } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: authApi.me,
    });

    const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
        queryKey: ["reviews", id],
        queryFn: () => reviewsApi.getByCourseId(id!),
        enabled: !!id && activeTab === "reviews",
    });

    const completeChapterMutation = useMutation({
        mutationFn: (chapterId: string) =>
            coursesApi.completeChapter(id!, chapterId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", id] });
        },
    });

    const subscribeCourseMutation = useMutation({
        mutationFn: () => coursesApi.subscribe(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", id] });
        },
    });

    const submitReviewMutation = useMutation({
        mutationFn: () =>
            reviewsApi.create({
                courseId: id!,
                rating: reviewRating,
                comment: reviewComment,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", id] });
            setReviewComment("");
            setReviewRating(5);
        },
    });

    const handleCompleteChapter = (chapterId: string) => {
        completeChapterMutation.mutate(chapterId);
    };

    const handleSubscribe = () => {
        subscribeCourseMutation.mutate();
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        submitReviewMutation.mutate();
    };

    const isAuthenticated = userResponse?.user !== null && userResponse?.user !== undefined;

    if (courseLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading course...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Course not found</div>
            </div>
        );
    }

    const calculateAverageRating = (): number => {
        if (!course.reviews || course.reviews.length === 0) return 0;
        const total = course.reviews.reduce((sum, review) => sum + review.rating, 0);
        return Math.round((total / course.reviews.length) * 10) / 10;
    };

    const reviews = reviewsResponse?.data || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate("/courses")}
                    className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
                >
                    ← Back to Courses
                </button>

                {/* Course Header */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {course.title}
                                </h1>
                                <p className="text-gray-600">{course.description}</p>
                            </div>
                            {!course.isSubscribed && isAuthenticated && (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribeCourseMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {subscribeCourseMutation.isPending
                                        ? "Subscribing..."
                                        : "Subscribe"}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 text-yellow-400 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-gray-700 font-medium">
                                    {calculateAverageRating().toFixed(1)} ({course.reviews.length}{" "}
                                    reviews)
                                </span>
                            </div>
                            {course.progress && (
                                <div className="text-gray-600">
                                    Progress: {course.progress.completed}/{course.progress.total}{" "}
                                    chapters ({course.progress.percentage}%)
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("chapters")}
                                className={`px-6 py-3 font-medium ${
                                    activeTab === "chapters"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Chapters
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`px-6 py-3 font-medium ${
                                    activeTab === "reviews"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Reviews
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === "chapters" && (
                            <div className="space-y-4">
                                {course.chapters.map((chapter, index) => (
                                    <div
                                        key={chapter.id}
                                        className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span className="text-gray-500 mr-2">
                                                    {index + 1}.
                                                </span>
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {chapter.title}
                                                </h3>
                                                {chapter.progress?.isCompleted && (
                                                    <span className="ml-2 text-green-600">✓</span>
                                                )}
                                            </div>
                                            <p className="text-gray-600">{chapter.description}</p>
                                        </div>
                                        {course.isSubscribed &&
                                            !chapter.progress?.isCompleted && (
                                                <button
                                                    onClick={() => handleCompleteChapter(chapter.id)}
                                                    disabled={completeChapterMutation.isPending}
                                                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 whitespace-nowrap"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-6">
                                {isAuthenticated && (
                                    <form onSubmit={handleSubmitReview} className="mb-8">
                                        <h3 className="text-xl font-semibold mb-4">
                                            Leave a Review
                                        </h3>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">
                                                Rating
                                            </label>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <button
                                                        key={rating}
                                                        type="button"
                                                        onClick={() => setReviewRating(rating)}
                                                        className={`text-3xl ${
                                                            rating <= reviewRating
                                                                ? "text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">
                                                Comment
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                required
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Share your thoughts about this course..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitReviewMutation.isPending}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {submitReviewMutation.isPending
                                                ? "Submitting..."
                                                : "Submit Review"}
                                        </button>
                                        {submitReviewMutation.isError && (
                                            <p className="text-red-600 mt-2">
                                                Error submitting review. Please try again.
                                            </p>
                                        )}
                                    </form>
                                )}

                                {!isAuthenticated && (
                                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-800">
                                            Please{" "}
                                            <button
                                                onClick={() => navigate("/sign-in")}
                                                className="font-semibold underline"
                                            >
                                                sign in
                                            </button>{" "}
                                            to leave a review.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
                                    {reviewsLoading ? (
                                        <p>Loading reviews...</p>
                                    ) : reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className={`text-xl ${
                                                                        star <= review.rating
                                                                            ? "text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="ml-2 text-gray-500 text-sm">
                                                            {new Date(
                                                                review.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No reviews yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Course;
