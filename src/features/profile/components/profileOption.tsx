import React from "react";
import { LucideIcon } from "lucide-react";

interface ProfileOptionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  showDivider?: boolean;
}

const profileOption: React.FC<ProfileOptionProps> = ({
  icon: Icon,
  label,
  onClick,
  showDivider = false,
}) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-900 to-blue-400 p-2 rounded-lg text-white">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-gray-800 font-medium text-sm">{label}</span>
        </div>
        <span className="text-gray-400">{">"}</span>
      </button>

      {showDivider && <hr className="border-t border-gray-200 mt-1" />}
    </div>
  );
};

export default profileOption;
