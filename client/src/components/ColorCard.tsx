import React from "react";

interface ColorCardProps {
  color: string;
  onClick: () => void;
  flash: boolean;
}

const ColorCard: React.FC<ColorCardProps> = ({ color, onClick, flash }) => {
  return (
    <div
      onClick={onClick}
      className={`colorCard ${color} ${flash ? "flash" : ""}`}
    ></div>
  );
};

export default ColorCard;
