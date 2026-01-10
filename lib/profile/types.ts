/**
 * Profile Field Configuration Types
 *
 * These types define the structure for configuring editable fields in member profiles.
 * Each field type has specific properties that control how it's displayed and edited.
 */

/**
 * Baserow file field response structure
 */
export interface BaserowFile {
  url: string;
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width?: number;
  image_height?: number;
  uploaded_at: string;
  thumbnails?: {
    tiny?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    card_cover?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

/**
 * Linked record value structure
 */
export interface LinkedRecord {
  id: number;
  value: string;
}

/**
 * Select option structure
 */
export interface SelectOption {
  id: number;
  label: string;
  color: string;
}

/**
 * Base field configuration
 */
interface BaseFieldConfig {
  fieldKey: string; // The key in MEMBERS_FIELDS
  label: string; // Display label
  description?: string; // Optional help text
}

/**
 * Read-only field (cannot be edited)
 */
export interface ReadOnlyFieldConfig extends BaseFieldConfig {
  type: 'readonly';
}

/**
 * Text field (short text input)
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

/**
 * Number field
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
}

/**
 * Date field
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date';
}

/**
 * Single-select field (dropdown with one choice)
 */
export interface SingleSelectFieldConfig extends BaseFieldConfig {
  type: 'single-select';
  options: SelectOption[];
  otherFieldKey?: string; // Field key for "Other" text input
  otherLabel?: string; // Label for "Other" option
  otherOptionId?: number; // ID of the "Other" option
}

/**
 * Multi-select field (checkbox group with multiple choices)
 */
export interface MultiSelectFieldConfig extends BaseFieldConfig {
  type: 'multi-select';
  options: SelectOption[];
}

/**
 * Linked records field (select from another table)
 */
export interface LinkedRecordsFieldConfig extends BaseFieldConfig {
  type: 'linked-records';
  tableId: number; // The linked table ID
  displayField?: string; // Which field to display (default: "Name")
  multiple?: boolean; // Allow multiple selections
  otherFieldKey?: string; // Field key for "Other" text input
  otherLabel?: string; // Label for "Other" option
  hasOther?: boolean; // Enable "Other" option
}

/**
 * File upload field (for images, documents, etc.)
 */
export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file';
  accept?: string; // File types to accept (e.g., "image/*")
  maxSize?: number; // Max file size in bytes
}

/**
 * Union type of all field configurations
 */
export type ProfileFieldConfig =
  | ReadOnlyFieldConfig
  | TextFieldConfig
  | NumberFieldConfig
  | DateFieldConfig
  | SingleSelectFieldConfig
  | MultiSelectFieldConfig
  | LinkedRecordsFieldConfig
  | FileFieldConfig;

/**
 * Profile section (group of related fields)
 */
export interface ProfileSection {
  id: string;
  title: string;
  description?: string;
  fields: ProfileFieldConfig[];
}

/**
 * Complete profile configuration
 */
export interface ProfileConfig {
  sections: ProfileSection[];
}

/**
 * Field value types
 */
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | number[] // For multi-select (option IDs)
  | LinkedRecord[] // For linked records
  | BaserowFile[]; // For file fields

/**
 * Member data type (from Baserow)
 */
export interface MemberData {
  id: number;
  [key: string]: FieldValue;
}

/**
 * Field changes tracking
 */
export interface FieldChanges {
  [fieldKey: string]: FieldValue;
}
