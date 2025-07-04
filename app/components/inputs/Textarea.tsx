"use client";

import { ChangeEvent } from "react";

interface TextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none min-h-[120px]"
      />
    </div>
  );
};

export default Textarea;