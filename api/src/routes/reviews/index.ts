import { Router } from "express";
import db from "~/data-source";
import { Review } from "~/entities";
import { IsAuthenticated } from "~/middlewares";

const reviewRepo = db.getRepository(Review);

const router = Router();

router.get("/:courseId", async (req, res) => {
    const courseId = req.params.courseId;

    try {
        const reviews = await reviewRepo.find({
            where: { courseId },
            order: { createdAt: "DESC" },
        });

        res.json({
            ok: true,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: "Failed to fetch reviews",
        });
    }
});

router.post("/", IsAuthenticated, async (req, res) => {
    const { courseId, rating, comment } = req.body;
    const userId = req.session.userId!;

    try {
        let review = await reviewRepo.findOne({
            where: { courseId, userId },
        });

        if (review) {
            review.rating = rating;
            review.comment = comment;
        } else {
            review = reviewRepo.create({
                courseId,
                userId,
                rating,
                comment,
            });
        }

        await reviewRepo.save(review);

        res.json({
            ok: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: "Failed to submit review",
        });
    }
});

export default router;
