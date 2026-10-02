import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | '';
  onChange: (value: number | '') => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, className, ...props }) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      setDisplayValue('');
    } else {
      setDisplayValue(new Intl.NumberFormat('vi-VN').format(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    let rawValue = e.target.value.replace(/\./g, '');
    
    if (rawValue.length > 8) {
      return;
    }

    if (rawValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    if (/^\d+$/.test(rawValue)) {
      const numValue = Number(rawValue);
      setDisplayValue(new Intl.NumberFormat('vi-VN').format(numValue));
      onChange(numValue);
    }
  };

  return (
    <input
      type="text"
      className={className}
      value={displayValue}
      onChange={handleChange}
      inputMode="numeric"
      {...props}
    />
  );
};
