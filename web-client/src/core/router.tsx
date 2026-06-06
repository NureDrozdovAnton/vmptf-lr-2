import { createBrowserRouter, Navigate } from "react-router-dom";
import Courses from "~/pages/courses";
import Course from "~/pages/course";
import SignIn from "~/pages/sign-in";
import SignUp from "~/pages/sign-up";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/courses" replace />,
    },
    {
        path: "/courses",
        element: <Courses />,
    },
    {
        path: "/courses/:id",
        element: <Course />,
    },
    {
        path: "/sign-in",
        element: <SignIn />,
    },
    {
        path: "/sign-up",
        element: <SignUp />,
    },
]);

export default router;
