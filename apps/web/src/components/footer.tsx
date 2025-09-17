import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="px-6 py-8 md:px-6 md:py-12">
        <div className="m-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                <Link
                  className="transition-colors hover:text-green-500"
                  to="/"
                >
                  Codewizard Training
                </Link>{" "}
                <span>© 2025</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <a
                  className="transition-colors hover:text-green-500"
                  href="mailto:contact@codewizard.training"
                >
                  contact@codewizard.training
                </a>
              </div>
            </div>
            <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400">
              <span className="pb-2">Built with ❤️ by Codewizard</span>
              <span>
                Design inspired by{" "}
                <a
                  className="hover:text-green-400"
                  href="https://typecraft.dev"
                >
                  typecraft
                </a>
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link
                className="transition-colors hover:text-green-500"
                to="/terms"
              >
                Terms of Service
              </Link>
              <Link
                className="transition-colors hover:text-green-500"
                to="/privacy"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
