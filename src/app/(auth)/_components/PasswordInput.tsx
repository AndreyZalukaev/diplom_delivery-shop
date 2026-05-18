"use client";

import { useState } from 'react';
import IconVision from "@/components/svg/IconVision";
import Tooltip from '@/app/(auth)/_components/Tooltip';
import { formStyles } from '@/app/(auth)/styles';

interface PasswordInputProps {
  id: string;
  label: string;
  value?: string;
  onChangeAction: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showRequirements?: boolean;
  compareWith?: string;
  showPassword?: boolean;
  togglePasswordVisibilityAction?: () => void;
}

const PasswordInput = ({
  id,
  label,
  value = "",
  onChangeAction,
  showRequirements = false,
  compareWith = '',
  showPassword: externalShowPassword,
  togglePasswordVisibilityAction,
}: PasswordInputProps) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  
  const isControlled = externalShowPassword !== undefined && togglePasswordVisibilityAction !== undefined;
  const showPassword = isControlled ? externalShowPassword : internalShowPassword;
  
  const togglePasswordVisibility = () => {
    if (isControlled && togglePasswordVisibilityAction) {
      togglePasswordVisibilityAction();
    } else {
      setInternalShowPassword(!internalShowPassword);
    }
  };

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const isPasswordValid = passwordRegex.test(value);

  const shouldShowTooltip = () => {
    if (showRequirements) {
      return value.length > 0 && !isPasswordValid;
    }
    if (compareWith) {
      return value.length > 0 && value !== compareWith;
    }
    return false;
  };

  const getTooltipText = () => {
    if (showRequirements) {
      return 'Пароль должен содержать 6+ символов, буквы и цифры';
    }
    if (compareWith) {
      return 'Пароли не совпадают';
    }
    return '';
  };

  return (
    <div className="relative">
      <label htmlFor={id} className={formStyles.label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChangeAction}
          className={formStyles.input}
          autoComplete="off"
          onFocus={(e) => e.target.removeAttribute('readOnly')}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <IconVision showPassword={showPassword} />
        </button>
      </div>
      {shouldShowTooltip() && <Tooltip text={getTooltipText()} />}
    </div>
  );
};

export default PasswordInput;
