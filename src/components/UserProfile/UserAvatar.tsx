const UserAvatar = ({ fullName = "" }) => {
  const getInitials = () => {
    const full = fullName?.charAt(0).toUpperCase() || "";
    return full;
  };

  return (
    <div className="w-full max-w-24 h-full min-h-24 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-xl">
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
