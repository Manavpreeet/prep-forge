import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

export function RouteErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Something went off track";
  const description = isRouteErrorResponse(error)
    ? "The page could not be loaded. Please try again or go back to practice."
    : "We hit an unexpected issue. Your progress is safe, and you can continue from the home screen.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-on-surface">
      <div className="w-full max-w-xl rounded-lg border border-stone-100 bg-white p-8 text-center shadow-soft">
        <p className="mb-2 text-xs uppercase tracking-widest text-stone-500">PrepForge</p>
        <h1 className="mb-3 font-headline-lg text-headline-lg">{title}</h1>
        <p className="mb-6 text-on-surface-variant">{description}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border-2 border-primary px-6 py-3 font-headline-md text-primary transition-colors hover:bg-primary/5"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full bg-primary px-6 py-3 font-headline-md text-on-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
