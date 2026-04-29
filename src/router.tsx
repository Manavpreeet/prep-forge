import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { HomePage } from "./ui/pages/HomePage";
import { PatternsPage } from "./ui/pages/PatternsPage";
import { RollingForQuestionPage } from "./ui/pages/RollingForQuestionPage";
import { QuestionFoundPage } from "./ui/pages/QuestionFoundPage";
import { DashboardPage } from "./ui/pages/DashboardPage";
import { PracticeQuestionPage } from "./ui/pages/PracticeQuestionPage";
import { RouteErrorPage } from "./ui/pages/RouteErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "patterns", element: <PatternsPage /> },
      { path: "rolling", element: <RollingForQuestionPage /> },
      { path: "found", element: <QuestionFoundPage /> },
      { path: "practice", element: <PracticeQuestionPage /> },
      { path: "dashboard", element: <DashboardPage /> }
    ],
  },
]);

