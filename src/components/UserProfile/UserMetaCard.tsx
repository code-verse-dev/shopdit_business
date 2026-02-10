import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { UPLOADS_URL } from "../../constants/api";
import { useEditProfileMutation } from "../../redux/services/userSlice";
import UserAvatar from "./UserAvatar";
import { ErrorPopup, SuccessPopup } from "../popup/Popup";
import { useNavigate } from "react-router";

export default function UserMetaCard({ profile }: { profile: any }) {
  const [editProfile, { isLoading }] = useEditProfileMutation();
  const [showOverlay, setShowOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const handleChangeImage = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await editProfile(formData);
      SuccessPopup(`Image updated successfully.`);
      navigate(0);
    } catch (err: any) {
      ErrorPopup(`Failed to update image`);
    }
  };

  const handleDeleteImage = async () => {
    const formData = new FormData();
    formData.append("image", "null");

    try {
      await editProfile(formData);
      SuccessPopup(`Image deleted successfully.`);
      navigate(0);
    } catch (err: any) {
      ErrorPopup(`Failed to delete image`);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div
              className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 relative group"
              onClick={() => setShowOverlay((prev) => !prev)}
              onMouseEnter={() => setShowOverlay(true)}
              onMouseLeave={() => setShowOverlay(false)}
            >
              {profile?.image && !imgError ? (
                <img
                  src={UPLOADS_URL + profile.image}
                  alt="user"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <UserAvatar fullName={profile?.fullName} />
              )}

              {showOverlay && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 rounded-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeImage();
                    }}
                    className="text-white bg-blue-600 p-1 rounded-full hover:bg-blue-700"
                    title="Change Image"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>

                  {profile?.image && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage();
                      }}
                      className="text-white bg-red-600 p-1 rounded-full hover:bg-red-700"
                      title="Remove Image"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {profile?.fullName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                {profile?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
