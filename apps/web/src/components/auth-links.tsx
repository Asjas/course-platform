import { Link } from "~/components/ui/nav-link";

interface Props {
  showSignIn?: boolean;
  showSignUp?: boolean;
  showForgotPassword?: boolean;
  className?: string;
}

export default function AuthLinks({
  showSignIn = true,
  showSignUp = true,
  showForgotPassword = true,
  className,
}: Props) {
  return (
    <div className={className ?? "flex flex-col items-start gap-1"}>
      {showSignIn && (
        <div className="text-sm">
          Already have an account?{" "}
          <Link
            className="text-primary-600 underline hover:text-green-600 hover:no-underline"
            to="/signin"
          >
            Sign in
          </Link>
        </div>
      )}

      {showSignUp && (
        <div className="text-sm">
          Don&apos;t have an account?{" "}
          <Link
            className="text-primary-600 underline hover:text-green-600 hover:no-underline"
            to="/signup"
          >
            Sign up
          </Link>
        </div>
      )}

      {showForgotPassword && (
        <div className="text-sm">
          Forgot password?{" "}
          <Link
            className="text-primary-600 underline hover:text-green-600 hover:no-underline"
            to="/resetpassword"
          >
            Reset password
          </Link>
        </div>
      )}
    </div>
  );
}
