import type React from "react";
import { TextInput } from "hds-react";

interface YearRangeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSliderRelease?: () => void;
  placeholder: string;
  clearButtonAriaLabel: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

/**
 * Year input with range slider + number input.
 */
export const YearRangeInput: React.FC<YearRangeInputProps> = ({
  id,
  label,
  value,
  onChange,
  onSliderRelease,
  placeholder,
  clearButtonAriaLabel,
  minYear = 0,
  maxYear = new Date().getFullYear(),
  disabled = false,
}) => {
  const numValue = value ? Number.parseInt(value, 10) : null;
  const isValidYear =
    numValue !== null &&
    !Number.isNaN(numValue) &&
    numValue >= minYear &&
    numValue <= maxYear;
  const sliderValue = isValidYear ? numValue : minYear;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = (e.target as HTMLInputElement)?.value ?? "";
    if (v === "" || /^-?\d{0,4}$/.test(v)) {
      onChange(v);
    }
  };

  return (
    <div
      className="year-range-input"
      {...(value && { "data-hds-textinput-filled": "true" })}
    >
      <label htmlFor={id} className="year-range-input__label">
        {label}
      </label>
      <TextInput
        id={id}
        type="text"
        inputMode="numeric"
        label=""
        hideLabel
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        clearButton={true}
        clearButtonAriaLabel={clearButtonAriaLabel}
        disabled={disabled}
      />
      <div className="year-range-input__slider-wrapper">
        <input
          type="range"
          id={`${id}-slider`}
          className="year-range-input__slider"
          min={minYear}
          max={maxYear}
          step={1}
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseUp={onSliderRelease}
          onTouchEnd={onSliderRelease}
          disabled={disabled}
          aria-label={`${label}, ${Drupal.t("range @min to @max", {
            "@min": minYear,
            "@max": maxYear,
          })}`}
        />
        <span
          className="year-range-input__range-labels"
          aria-label={`${label}: ${Drupal.t("@min — @max", {
            "@min": minYear,
            "@max": maxYear,
          })}`}
        >
          <span>{minYear}</span>
          <span className="visually-hidden"> — </span>
          <span>{maxYear}</span>
        </span>
      </div>
    </div>
  );
};
