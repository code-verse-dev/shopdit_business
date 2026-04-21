import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { ImageUrl } from '../../utils/Functions';
import {
  RESET_ACCOUNT_TYPE,
  useResetPasswordMutation,
} from "../../redux/services/authSlice";
import { ErrorPopup } from "../popup/Popup";

type LocationState = { email?: string; code?: string };

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const email = state.email?.trim() ?? "";
  const code = state.code?.trim() ?? "";
  const [resetPassword] = useResetPasswordMutation();

  useEffect(() => {
    if (!email || !code) {
      navigate("/forgotpassword", { replace: true });
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    if (!email || !code) {
      setLoading(false);
      navigate("/forgotpassword", { replace: true });
      return;
    }

    try {
      await resetPassword({
        email,
        code,
        password,
        type: RESET_ACCOUNT_TYPE,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "You can now log in with your new password.",
        confirmButtonColor: "#F6075A",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/signin");
      });
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:w-lg">
      <div className="bg-white p-8 rounded-lg">
        <Link to="/" className="block mb-4">
          <img
            width={100}
            height={48}
            src={ImageUrl("logo/logo.svg")}
            alt="Logo"
            className="mx-auto"
          />
        </Link>
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Enter a new password for your account.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* New Password */}
            <div>
              <Label>
                New Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  name="password"
                  className="web-input"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label>
                Confirm Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  name="confirmPassword"
                  className="web-input"
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-error-500">{error}</p>}

            {/* Submit Button */}
            <div>
              <Button
                className="w-full mt-4 web-btn"
                size="sm"
                loading={loading}
                type="submit"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
