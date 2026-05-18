'use client';

import { formStyles } from '@/app/(auth)/styles';

interface PersonInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonInput = ({ id, label, value, onChange }: PersonInputProps) => {
  return (
    <div>
      <label htmlFor={id} className={formStyles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value || ""}
        onChange={onChange}
        className={formStyles.input}
      />
    </div>
  );
};

export default PersonInput;
