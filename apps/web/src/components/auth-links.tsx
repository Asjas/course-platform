import { Link } from "@tanstack/react-router";

type Props = {
  showSignIn?: boolean;
  showSignUp?: boolean;
  showForgotPassword?: boolean;
  className?: string;
};

export default function AuthLinks({
  showSignIn = true,
  showSignUp = true,
  showForgotPassword = true,
  className,
}: Props) {
  return (
    <div className={className ?? "flex flex-col gap-2 px-4 pb-4"}>
      {showSignIn && (
        <div className="text-sm">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-primary-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      )}

      {showSignUp && (
        <div className="text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary-600 hover:underline"
          >
            Sign up
          </Link>
        </div>
      )}

      {showForgotPassword && (
        <div className="text-sm">
          Forgot password?{" "}
          <Link
            to="/forgotpassword"
            className="text-primary-600 hover:underline"
          >
            Reset password
          </Link>
        </div>
      )}
    </div>
  );
}
