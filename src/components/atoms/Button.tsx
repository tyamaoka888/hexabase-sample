import React, { FC } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: FC<ButtonProps> = ({ type = "button", onClick, children }) => {
  return (
    <button
      type={type}
      className="bg-blue-500 text-white rounded-md px-3 py-1 hover:bg-blue-600"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
