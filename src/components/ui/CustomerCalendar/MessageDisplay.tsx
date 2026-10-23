import React from "react";

interface MessageDisplayProps {
  type: string;
  text: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ type, text }) => {
  if (!text) return null;
  return (
    <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
      {text}
    </div>
  );
};

export default MessageDisplay;
