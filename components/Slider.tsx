'use client'

import React from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number; // acum acceptă max
}

const Slider: React.FC<SliderProps> = ({ value, onChange, max = 1 }) => {
  return (
    <input
      type="range"
      min={0}
      max={max}
      step={0.01}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-green-500"
    />
  );
};

export default Slider;
