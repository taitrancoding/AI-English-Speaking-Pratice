import React from "react";
import { Link } from "react-router-dom";

// Khuôn
interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  to: string;
}

// Build component ActionCard
const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  to,
}) => {
  return (
    <Link
      to={to}
      className="bg-white p-6 rounded-2xl shadow-lg text-center transition-transform duration-300 hover:scale-105"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-pink-100 text-pink-500">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-5">{description}</p>

      {/* Button */}
      <button className="bg-pink-400 hover:bg-pink-500 text-white font-semibold rounded-lg py-2 px-6 transition-colors duration-200">
        Open
      </button>
    </Link>
  );
};

export default ActionCard;