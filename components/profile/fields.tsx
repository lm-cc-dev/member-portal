'use client';

import { SelectOption, LinkedRecord } from '@/lib/profile/types';

// Option styling with consistent gradient colors
const optionColors = [
  { bg: 'bg-gradient-to-r from-blue-50 to-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-gradient-to-r from-violet-50 to-violet-100', border: 'border-violet-400', text: 'text-violet-700' },
  { bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
  { bg: 'bg-gradient-to-r from-amber-50 to-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
  { bg: 'bg-gradient-to-r from-rose-50 to-rose-100', border: 'border-rose-400', text: 'text-rose-700' },
  { bg: 'bg-gradient-to-r from-cyan-50 to-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700' },
  { bg: 'bg-gradient-to-r from-orange-50 to-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  { bg: 'bg-gradient-to-r from-teal-50 to-teal-100', border: 'border-teal-400', text: 'text-teal-700' },
];

function getOptionStyle(index: number, isSelected: boolean) {
  if (!isSelected) {
    return 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50';
  }
  const colorSet = optionColors[index % optionColors.length];
  return `${colorSet.border} ${colorSet.bg} ${colorSet.text} font-medium`;
}

// Base field wrapper for consistent styling
interface FieldWrapperProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

function FieldWrapper({ label, description, children, required }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {children}
    </div>
  );
}

// Read-only field
interface ReadOnlyFieldProps {
  label: string;
  value: string | number | null | undefined;
  description?: string;
}

export function ReadOnlyField({ label, value, description }: ReadOnlyFieldProps) {
  return (
    <FieldWrapper label={label} description={description}>
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
        {value || '—'}
      </div>
    </FieldWrapper>
  );
}

// Text field
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  description,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldWrapper label={label} description={description}>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </FieldWrapper>
  );
}

// Date field
interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function DateField({ label, value, onChange, description }: DateFieldProps) {
  return (
    <FieldWrapper label={label} description={description}>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </FieldWrapper>
  );
}

// Single select field
interface SingleSelectFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  options: SelectOption[];
  description?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherLabel?: string;
  otherOptionId?: number;
}

export function SingleSelectField({
  label,
  value,
  onChange,
  options,
  description,
  otherValue,
  onOtherChange,
  otherLabel = 'Other',
  otherOptionId,
}: SingleSelectFieldProps) {
  // Check if "Other" is selected - either by ID or by detecting "Other" label
  const isOtherSelected = otherOptionId
    ? value === otherOptionId
    : options.some((opt) => opt.id === value && opt.label.toLowerCase().includes('other'));

  return (
    <div className="space-y-2">
      <FieldWrapper label={label} description={description}>
        <div className="flex flex-wrap gap-2">
          {options.map((option, index) => {
            const isSelected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(isSelected ? null : option.id)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${getOptionStyle(index, isSelected)}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </FieldWrapper>

      {/* Show "Other" input when Other option is selected */}
      {isOtherSelected && onOtherChange && (
        <div className="mt-3 ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please specify {otherLabel.toLowerCase()}:
          </label>
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={`Enter ${otherLabel.toLowerCase()}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      )}
    </div>
  );
}

// Multi-select field
interface MultiSelectFieldProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  options: SelectOption[];
  description?: string;
}

export function MultiSelectField({
  label,
  value,
  onChange,
  options,
  description,
}: MultiSelectFieldProps) {
  const toggleOption = (optionId: number) => {
    const newValue = value?.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...(value || []), optionId];
    onChange(newValue);
  };

  return (
    <FieldWrapper label={label} description={description}>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isSelected = value?.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleOption(option.id)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${getOptionStyle(index, isSelected)}`}
            >
              {option.label}
              {isSelected && (
                <span className="ml-2">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

// Linked records field
interface LinkedRecordsFieldProps {
  label: string;
  value: LinkedRecord[];
  onChange: (value: LinkedRecord[]) => void;
  options: LinkedRecord[];
  description?: string;
  multiple?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherLabel?: string;
  hasOther?: boolean;
}

export function LinkedRecordsField({
  label,
  value,
  onChange,
  options,
  description,
  multiple = true,
  otherValue,
  onOtherChange,
  otherLabel = 'Other',
  hasOther = false,
}: LinkedRecordsFieldProps) {
  const selectedIds = value?.map((record) => record.id) || [];

  // Check if "Other" option is selected (detect by name matching "Other")
  const otherOption = options.find(
    (opt) => opt.value.toLowerCase() === 'other'
  );
  const isOtherSelected = otherOption ? selectedIds.includes(otherOption.id) : false;

  const toggleOption = (option: LinkedRecord) => {
    if (multiple) {
      const isSelected = selectedIds.includes(option.id);
      const newValue = isSelected
        ? value.filter((record) => record.id !== option.id)
        : [...value, option];
      onChange(newValue);
    } else {
      // Single selection
      const isSelected = selectedIds.includes(option.id);
      onChange(isSelected ? [] : [option]);
    }
  };

  return (
    <div className="space-y-2">
      <FieldWrapper label={label} description={description}>
        <div className="flex flex-wrap gap-2">
          {options.map((option, index) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${getOptionStyle(index, isSelected)}`}
              >
                {option.value}
                {isSelected && multiple && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </FieldWrapper>

      {/* Show "Other" input only when Other option is selected */}
      {hasOther && isOtherSelected && onOtherChange && (
        <div className="mt-3 ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please specify {otherLabel.toLowerCase()}:
          </label>
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={`Enter ${otherLabel.toLowerCase()}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      )}
    </div>
  );
}
