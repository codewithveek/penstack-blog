import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  InputHTMLAttributes,
  KeyboardEvent,
  FocusEvent,
  MouseEvent,
} from "react";
import { LuX } from "react-icons/lu";

// Type definitions
export type PillVariant =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "gray"
  | "orange";
export type PillSize = "sm" | "md" | "lg";
export type Separator = string | "Enter";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export type ValidatorFunction = (value: string) => boolean | string;

export interface PillInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onFocus" | "onBlur"
  > {
  // Core props
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;

  // Validation
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  validator?: ValidatorFunction | null;

  // Separators
  separators?: Separator[];
  trimWhitespace?: boolean;

  // Styling
  className?: string;
  containerClassName?: string;
  pillClassName?: string;
  inputClassName?: string;
  removeButtonClassName?: string;

  // Pill customization
  renderPill?:
    | ((pill: string, index: number, onRemove: () => void) => React.ReactNode)
    | null;
  pillVariant?: PillVariant;
  pillSize?: PillSize;

  // Input behavior
  clearOnBlur?: boolean;
  selectAllOnFocus?: boolean;
  autoFocus?: boolean;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Events
  onPillAdd?: (pill: string, allPills: string[]) => void;
  onPillRemove?: (
    removedPill: string,
    remainingPills: string[],
    removedIndex: number
  ) => void;
  onInputChange?: (inputValue: string) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onError?: (error: any) => void;

  // Advanced
  caseSensitive?: boolean;
  sortAlphabetically?: boolean;
}

interface StyleVariants {
  variants: Record<PillVariant, string>;
  sizes: Record<PillSize, string>;
}

export const PillInput: React.FC<PillInputProps> = ({
  // Core props
  value = [],
  onChange = () => {},
  placeholder = "Type and press comma to add...",
  disabled = false,
  readOnly = false,

  // Validation
  maxItems = Infinity,
  minLength = 1,
  maxLength = 100,
  allowDuplicates = false,
  validator = null,

  // Separators
  separators = [",", "Enter"],
  trimWhitespace = true,

  // Styling
  className = "",
  containerClassName = "",
  pillClassName = "",
  inputClassName = "",
  removeButtonClassName = "",

  // Pill customization
  renderPill = null,
  pillVariant = "blue",
  pillSize = "md",

  // Input behavior
  clearOnBlur = false,
  selectAllOnFocus = false,
  autoFocus = false,

  // Accessibility
  ariaLabel = "Multi-value input",
  ariaDescribedBy = "",

  // Events
  onPillAdd = () => {},
  onPillRemove = () => {},
  onInputChange = () => {},
  onFocus = () => {},
  onBlur = () => {},
  onError = () => {},

  // Advanced
  caseSensitive = true,
  sortAlphabetically = false,

  ...inputProps
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized styles
  const styles = useMemo<StyleVariants>(
    () => ({
      variants: {
        blue: "bg-blue-100 text-blue-800 border-blue-200",
        green: "bg-green-100 text-green-800 border-green-200",
        purple: "bg-purple-100 text-purple-800 border-purple-200",
        red: "bg-red-100 text-red-800 border-red-200",
        gray: "bg-gray-100 text-gray-800 border-gray-200",
        orange: "bg-orange-100 text-orange-800 border-orange-200",
      },
      sizes: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    }),
    []
  );

  // Controlled value with sorting
  const sortedValue = useMemo<string[]>(() => {
    return sortAlphabetically ? [...value].sort() : value;
  }, [value, sortAlphabetically]);

  // Validation function
  const validateValue = useCallback(
    (val: string): string => {
      if (!val || val.length < minLength) {
        return `Minimum ${minLength} characters required`;
      }
      if (val.length > maxLength) {
        return `Maximum ${maxLength} characters allowed`;
      }
      if (validator && typeof validator === "function") {
        const validationResult = validator(val);
        if (validationResult !== true) {
          return typeof validationResult === "string"
            ? validationResult
            : "Invalid value";
        }
      }
      return "";
    },
    [minLength, maxLength, validator]
  );

  // Create pill with validation
  const createPill = useCallback(
    (val: string): void => {
      if (disabled || readOnly) return;

      const processedValue = trimWhitespace ? val.trim() : val;
      if (!processedValue) return;

      const normalizedValue = caseSensitive
        ? processedValue
        : processedValue.toLowerCase();
      const existingValues = caseSensitive
        ? value
        : value.map((v: string) => v.toLowerCase());

      // Check for duplicates
      if (!allowDuplicates && existingValues.includes(normalizedValue)) {
        setError("Duplicate value");
        onError("Duplicate value");
        return;
      }

      // Check max items
      if (value.length >= maxItems) {
        setError(`Maximum ${maxItems} items allowed`);
        onError(`Maximum ${maxItems} items allowed`);
        return;
      }

      // Validate
      const validationError = validateValue(processedValue);
      if (validationError) {
        setError(validationError);
        onError(validationError);
        return;
      }

      // Clear any existing errors
      setError("");

      const newValue = [...value, processedValue];
      onChange(newValue);
      onPillAdd(processedValue, newValue);
      setInputValue("");
    },
    [
      disabled,
      readOnly,
      trimWhitespace,
      caseSensitive,
      value,
      allowDuplicates,
      maxItems,
      validateValue,
      onChange,
      onPillAdd,
      onError,
    ]
  );

  // Remove pill
  const removePill = useCallback(
    (indexToRemove: number): void => {
      if (disabled || readOnly) return;

      const removedValue = value[indexToRemove];
      const newValue = value.filter(
        (_: string, index: number) => index !== indexToRemove
      );
      onChange(newValue);
      onPillRemove(removedValue, newValue, indexToRemove);
      setError("");
    },
    [disabled, readOnly, value, onChange, onPillRemove]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = e.target.value;

      // Check for separators
      const hasSeparator = separators.some((sep: Separator) => {
        if (sep === "Enter") return false; // Handle Enter in keydown
        return newValue.includes(sep);
      });

      if (hasSeparator) {
        const separator = separators.find(
          (sep: Separator) => sep !== "Enter" && newValue.includes(sep)
        );
        if (separator) {
          const parts = newValue.split(separator);
          const valueToAdd = parts[0];
          const remaining = parts.slice(1).join(separator);

          if (valueToAdd) {
            createPill(valueToAdd);
          }
          setInputValue(remaining);
        }
      } else {
        setInputValue(newValue);
        onInputChange(newValue);
      }
    },
    [separators, createPill, onInputChange]
  );

  // Handle key events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (separators.includes("Enter") && e.key === "Enter") {
        e.preventDefault();
        createPill(inputValue);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        value.length > 0
      ) {
        e.preventDefault();
        removePill(value.length - 1);
      } else if (e.key === "Escape") {
        setInputValue("");
        setError("");
      }
    },
    [separators, inputValue, createPill, removePill, value.length]
  );

  // Handle focus events
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>): void => {
      setFocused(true);
      if (selectAllOnFocus && inputValue) {
        e.target.select();
      }
      onFocus(e);
    },
    [selectAllOnFocus, inputValue, onFocus]
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>): void => {
      setFocused(false);
      if (clearOnBlur) {
        setInputValue("");
      }
      if (inputValue && trimWhitespace) {
        createPill(inputValue);
      }
      onBlur(e);
    },
    [clearOnBlur, inputValue, trimWhitespace, createPill, onBlur]
  );

  // Container click handler
  const handleContainerClick = useCallback((): void => {
    if (!disabled && !readOnly) {
      inputRef.current?.focus();
    }
  }, [disabled, readOnly]);

  // Auto focus effect
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Custom pill renderer
  const renderPillContent = useCallback(
    (pill: string, index: number): React.ReactNode => {
      if (renderPill) {
        return renderPill(pill, index, () => removePill(index));
      }

      const pillStyles = `
      inline-flex items-center gap-1 rounded-full font-medium border
      ${styles.variants[pillVariant] || styles.variants.blue}
      ${styles.sizes[pillSize] || styles.sizes.md}
      ${pillClassName}
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm transition-all duration-150"}
    `;

      return (
        <div key={index} className={pillStyles}>
          <span className="select-none">{pill}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                removePill(index);
              }}
              disabled={disabled}
              className={`
              rounded-full p-0.5 transition-colors duration-150
              ${disabled ? "cursor-not-allowed" : "hover:bg-black hover:bg-opacity-10"}
              ${removeButtonClassName}
            `}
              aria-label={`Remove ${pill}`}
            >
              <LuX
                className={`${pillSize === "sm" ? "h-2.5 w-2.5" : pillSize === "lg" ? "h-4 w-4" : "h-3 w-3"}`}
              />
            </button>
          )}
        </div>
      );
    },
    [
      renderPill,
      removePill,
      styles,
      pillVariant,
      pillSize,
      pillClassName,
      disabled,
      readOnly,
      removeButtonClassName,
    ]
  );

  const containerStyles = `
    min-h-10 border rounded-lg p-2 flex flex-wrap items-center gap-2 bg-white transition-all duration-200
    ${focused ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300"}
    ${disabled ? "bg-gray-50 cursor-not-allowed" : readOnly ? "bg-gray-50" : "cursor-text hover:border-gray-400"}
    ${error ? "border-red-500 ring-2 ring-red-200" : ""}
    ${containerClassName}
    ${className}
  `;

  return (
    <div className="space-y-1">
      <div
        className={containerStyles}
        onClick={handleContainerClick}
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={focused}
        aria-invalid={!!error}
      >
        {sortedValue.map((pill: string, index: number) =>
          renderPillContent(pill, index)
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={value.length === 0 ? placeholder : ""}
          className={`
            flex-1 min-w-20 outline-none border-none bg-transparent
            ${disabled ? "cursor-not-allowed text-gray-400" : "text-gray-900"}
            placeholder-gray-500
            ${inputClassName}
          `}
          aria-label="Add new item"
          {...inputProps}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
