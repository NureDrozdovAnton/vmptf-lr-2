import db from "~/data-source";
import { Chapter, Course } from "~/entities";

const courseRepo = db.getRepository(Course);
const chapterRepo = db.getRepository(Chapter);

export const setupFixtures = async () => {
    if ((await courseRepo.count()) > 0) {
        return;
    }
    const course1 = courseRepo.create({
        title: "Introduction to Programming",
        description:
            "Learn the basics of programming with this introductory course.",
        image: "https://placehold.co/300x200/744577/FFFFFF?text=Course+1&font=Raleway",
    });
    await courseRepo.save(course1);

    const course2 = courseRepo.create({
        title: "Web Development with React",
        description:
            "Build modern web applications using React and related technologies.",
        image: "https://placehold.co/300x200/546B41/FFFFFF?text=Course+2&font=Raleway",
    });
    await courseRepo.save(course2);

    const chapter1 = chapterRepo.create({
        courseId: course1.id,
        title: "Getting Started with Programming",
        description: "An introduction to programming concepts and tools.",
        image: "https://placehold.co/300x200/99AD7A/000000?text=Chapter+1&font=Raleway",
    });
    await chapterRepo.save(chapter1);

    const chapter2 = chapterRepo.create({
        courseId: course1.id,
        title: "Data Structures and Algorithms",
        description:
            "Learn about common data structures and algorithms used in programming.",
        image: "https://placehold.co/300x200/C7EABB/000000?text=Chapter+2&font=Raleway",
    });
    await chapterRepo.save(chapter2);

    const chapter3 = chapterRepo.create({
        courseId: course2.id,
        title: "Introduction to React",
        description: "Learn the basics of React and how to create components.",
        image: "https://placehold.co/300x200/E8F5BD/000000?text=Chapter+3&font=Raleway",
    });
    await chapterRepo.save(chapter3);

    const chapter4 = chapterRepo.create({
        courseId: course2.id,
        title: "State Management with Redux",
        description: "Learn how to manage application state using Redux.",
        image: "https://placehold.co/300x200/A8BBA3/000000?text=Chapter+4&font=Raleway",
    });
    await chapterRepo.save(chapter4);
};
