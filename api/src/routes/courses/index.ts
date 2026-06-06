import { Router } from "express";
import { In } from "typeorm";
import db from "~/data-source";
import {
    Chapter,
    Course,
    Review,
    Subscription,
    UserProgress,
} from "~/entities";
import { IsAuthenticated } from "~/middlewares";

const router = Router();

const courseRepo = db.getRepository(Course);
const chapterRepo = db.getRepository(Chapter);
const subscriptionRepo = db.getRepository(Subscription);
const userProgressRepo = db.getRepository(UserProgress);
const reviewRepo = db.getRepository(Review);

router.get("/", async (req, res) => {
    try {
        const courses = await courseRepo.find({ relations: { reviews: true } });
        const userId = req.session.userId;

        if (!userId) {
            return res.json(courses);
        }

        const subscriptions = await subscriptionRepo.find({
            where: { userId },
        });
        const subscribedCourseIds = new Set(
            subscriptions.map((s) => s.courseId)
        );

        const coursesWithStatus = await Promise.all(
            courses.map(async (course) => {
                const isSubscribed = subscribedCourseIds.has(course.id);

                if (!isSubscribed) {
                    return {
                        ...course,
                        isSubscribed: false,
                        progress: null,
                    };
                }

                const chapters = await chapterRepo.find({
                    where: { courseId: course.id },
                });

                const chapterIds = chapters.map((c) => c.id);
                const completedProgress = await userProgressRepo.find({
                    where: {
                        userId,
                        chapterId: In(chapterIds.length > 0 ? chapterIds : []),
                    },
                });

                const completedCount = completedProgress.filter(
                    (p) => p.completedAt !== null
                ).length;

                return {
                    ...course,
                    isSubscribed: true,
                    progress: {
                        total: chapters.length,
                        completed: completedCount,
                        percentage:
                            chapters.length > 0
                                ? Math.round(
                                      (completedCount / chapters.length) * 100
                                  )
                                : 0,
                    },
                };
            })
        );

        res.json(coursesWithStatus);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseRepo.findOne({
            where: { id },
            relations: { reviews: true },
        });

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const chapters = await chapterRepo.find({
            where: { courseId: id },
            order: { createdAt: "ASC" },
        });

        const userId = req.session.userId;

        if (!userId) {
            return res.json({
                ...course,
                chapters,
                isSubscribed: false,
                progress: null,
            });
        }

        const subscription = await subscriptionRepo.findOne({
            where: { userId, courseId: id },
        });

        if (!subscription) {
            return res.json({
                ...course,
                chapters,
                isSubscribed: false,
                progress: null,
            });
        }

        const chapterIds = chapters.map((c) => c.id);
        const userProgress = await userProgressRepo.find({
            where: {
                userId,
                chapterId: In(chapterIds.length > 0 ? chapterIds : []),
            },
        });

        const progressMap = new Map(userProgress.map((p) => [p.chapterId, p]));

        const chaptersWithProgress = chapters.map((chapter) => {
            const progress = progressMap.get(chapter.id);
            return {
                ...chapter,
                progress: progress
                    ? {
                          startedAt: progress.startedAt,
                          completedAt: progress.completedAt,
                          isCompleted: progress.completedAt !== null,
                      }
                    : null,
            };
        });

        const completedCount = userProgress.filter(
            (p) => p.completedAt !== null
        ).length;

        res.json({
            ...course,
            chapters: chaptersWithProgress,
            isSubscribed: true,
            progress: {
                total: chapters.length,
                completed: completedCount,
                percentage:
                    chapters.length > 0
                        ? Math.round((completedCount / chapters.length) * 100)
                        : 0,
            },
        });
    } catch (error) {
        console.error("Error fetching course details:", error);
        res.status(500).json({ error: "Failed to fetch course details" });
    }
});

router.post("/:id/subscribe", IsAuthenticated, async (req, res) => {
    try {
        const id = req.params.id as string;
        const userId = req.session.userId!;

        const course = await courseRepo.findOne({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const existingSubscription = await subscriptionRepo.findOne({
            where: { userId, courseId: id },
        });

        if (existingSubscription) {
            return res
                .status(400)
                .json({ error: "Already subscribed to this course" });
        }

        const subscription = subscriptionRepo.create({
            userId,
            courseId: id,
        });

        await subscriptionRepo.save(subscription);

        res.status(201).json({
            message: "Successfully subscribed to course",
            subscription,
        });
    } catch (error) {
        console.error("Error subscribing to course:", error);
        res.status(500).json({ error: "Failed to subscribe to course" });
    }
});

router.post(
    "/:id/chapters/:chapterId/complete",
    IsAuthenticated,
    async (req, res) => {
        try {
            const id = req.params.id as string;
            const chapterId = req.params.chapterId as string;
            const userId = req.session.userId!;

            const course = await courseRepo.findOne({ where: { id } });
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            const chapter = await chapterRepo.findOne({
                where: { id: chapterId, courseId: id },
            });
            if (!chapter) {
                return res.status(404).json({ error: "Chapter not found" });
            }

            const subscription = await subscriptionRepo.findOne({
                where: { userId, courseId: id },
            });
            if (!subscription) {
                return res
                    .status(403)
                    .json({ error: "Not subscribed to this course" });
            }

            let progress = await userProgressRepo.findOne({
                where: { userId, chapterId },
            });

            if (progress) {
                if (progress.completedAt) {
                    return res
                        .status(400)
                        .json({ error: "Chapter already completed" });
                }
                progress.completedAt = new Date();
            } else {
                progress = userProgressRepo.create({
                    userId,
                    chapterId,
                    startedAt: new Date(),
                    completedAt: new Date(),
                });
            }

            await userProgressRepo.save(progress);

            res.json({
                message: "Chapter marked as complete",
                progress,
            });
        } catch (error) {
            console.error("Error completing chapter:", error);
            res.status(500).json({ error: "Failed to complete chapter" });
        }
    }
);

export default router;
