'use client';

import React from "react";

interface InputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default Input;
