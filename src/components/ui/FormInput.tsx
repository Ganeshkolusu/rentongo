import React from "react";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  name,
}) => {
  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor={name}
        className="absolute -top-2 left-3 bg-white px-1 text-sm font-semibold text-gray-900"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
    </div>
  );
};

export default FormInput;
