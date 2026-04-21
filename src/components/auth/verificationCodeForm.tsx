import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import VerificationInput from "react-verification-input";
import Button from "../ui/button/Button";
import { ImageUrl } from '../../utils/Functions';
import { useVerifyRecoverCodeMutation } from "../../redux/services/authSlice";
import { ErrorPopup } from "../popup/Popup";

type ForgotFlowLocationState = { email?: string };

export default function VerificationCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as ForgotFlowLocationState | null)?.email?.trim();
  const [verifyRecoverCode] = useVerifyRecoverCodeMutation();

  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      await verifyRecoverCode({ email, code }).unwrap();
      navigate("/reset-password", { state: { email, code } });
    } catch (err: any) {
      ErrorPopup(err?.data?.message ?? "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:w-lg">
      <div className="bg-white p-8 rounded-lg">
        <div>
          <img
            width={100}
            height={48}
            src={ImageUrl("logo/logo.svg")}
            alt="Logo"
            className="mx-auto mb-6"
          />
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Enter the 4-digit code sent to your email
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <VerificationInput
                length={4}
                onChange={setCode}
                value={code}
                placeholder=""
                classNames={{
                  container: "flex gap-3",
                  character:
                    "w-12 h-12 rounded-md border border-gray-300 text-center text-lg text-gray-800 dark:text-white focus:border-primary-500 outline-none",
                  characterFilled: "bg-primary-500 text-white",
                  characterInactive: "bg-gray-100 dark:bg-gray-700",
                }}
              />
            </div>

            <div>
              <Button
                className="w-full mt-4 web-btn"
                size="sm"
                loading={loading}
                type="submit"
                disabled={code.length !== 4}
              >
                Verify
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
