/**
 * Profile Field Update Utilities
 *
 * Functions for detecting changes and preparing field updates for Baserow.
 */

import { FieldValue, FieldChanges, MemberData } from './types';
import { MEMBERS_FIELDS, MEMBERS_FIELD_NAMES } from '../baserow/config';

/**
 * Compare two field values for equality
 */
function areValuesEqual(a: FieldValue, b: FieldValue): boolean {
  // Handle null/undefined
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;

  // Handle single-select: compare {id, value, color} object with number
  // This happens when original is from Baserow (object) and new is from form (number ID)
  if (typeof a === 'object' && !Array.isArray(a) && 'id' in a && typeof b === 'number') {
    return (a as { id: number }).id === b;
  }
  if (typeof b === 'object' && !Array.isArray(b) && 'id' in b && typeof a === 'number') {
    return (b as { id: number }).id === a;
  }

  // Handle arrays (multi-select, linked records)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    // For arrays of numbers (multi-select option IDs)
    if (a.every((item) => typeof item === 'number') && b.every((item) => typeof item === 'number')) {
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, idx) => val === sortedB[idx]);
    }

    // Handle mixed: array of objects vs array of numbers (multi-select)
    // Original from Baserow has [{id, value, color}], form has [id, id, id]
    if (a.every((item) => typeof item === 'object' && item !== null && 'id' in item) &&
        b.every((item) => typeof item === 'number')) {
      const idsA = a.map((item: any) => item.id).sort();
      const sortedB = [...b].sort();
      return idsA.length === sortedB.length && idsA.every((id, idx) => id === sortedB[idx]);
    }
    if (b.every((item) => typeof item === 'object' && item !== null && 'id' in item) &&
        a.every((item) => typeof item === 'number')) {
      const idsB = b.map((item: any) => item.id).sort();
      const sortedA = [...a].sort();
      return idsB.length === sortedA.length && idsB.every((id, idx) => id === sortedA[idx]);
    }

    // For arrays of objects (linked records) - both are objects
    if (a.every((item) => typeof item === 'object' && item !== null && 'id' in item) &&
        b.every((item) => typeof item === 'object' && item !== null && 'id' in item)) {
      const idsA = a.map((item: any) => item.id).sort();
      const idsB = b.map((item: any) => item.id).sort();
      return idsA.every((id, idx) => id === idsB[idx]);
    }

    // For file arrays
    if (a.every((item) => typeof item === 'object' && item !== null && 'url' in item)) {
      const urlsA = a.map((item: any) => item.url).sort();
      const urlsB = b.map((item: any) => item.url).sort();
      return urlsA.every((url, idx) => url === urlsB[idx]);
    }
  }

  // Handle primitives
  return a === b;
}

/**
 * Get the field ID for a given field key
 */
function getFieldId(fieldKey: string): string {
  const fieldId = MEMBERS_FIELDS[fieldKey as keyof typeof MEMBERS_FIELDS];
  if (!fieldId) {
    throw new Error(`Unknown field key: ${fieldKey}`);
  }
  return fieldId;
}

/**
 * Get the field name for a given field key
 */
function getFieldName(fieldKey: string): string {
  const fieldName = MEMBERS_FIELD_NAMES[fieldKey];
  if (!fieldName) {
    throw new Error(`Unknown field key: ${fieldKey}`);
  }
  return fieldName;
}

/**
 * Detect which fields have changed between original and modified data
 * Returns only the changed fields with their new values
 * Note: originalData uses field names (e.g., 'Name'), modifiedData uses field keys (e.g., 'NAME')
 */
export function detectChanges(
  originalData: MemberData,
  modifiedData: Record<string, FieldValue>
): FieldChanges {
  const changes: FieldChanges = {};

  // Compare each field in the modified data
  for (const [fieldKey, newValue] of Object.entries(modifiedData)) {
    // Skip the ID field - it can never be changed
    if (fieldKey === 'id' || fieldKey === 'ID') continue;

    // Get the field name for looking up original value
    const fieldName = getFieldName(fieldKey);
    const originalValue = originalData[fieldName];

    // If the value has changed, add to changes with field name (for useFieldNames=true API)
    if (!areValuesEqual(originalValue, newValue)) {
      changes[fieldName] = newValue;
    }
  }

  return changes;
}

/**
 * Prepare linked records value for Baserow API
 * Converts array of LinkedRecord objects or IDs to array of IDs
 */
export function prepareLinkedRecordsValue(
  value: any
): number[] | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    // If array of objects with 'id' property
    if (value.every((item) => typeof item === 'object' && 'id' in item)) {
      return value.map((item) => item.id);
    }
    // If already array of numbers
    if (value.every((item) => typeof item === 'number')) {
      return value;
    }
  }

  return null;
}

/**
 * Prepare a field value for Baserow API based on field type
 */
export function prepareFieldValue(
  value: FieldValue,
  fieldType?: string
): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Handle single-select objects with {id, value, color} - extract just the ID
  if (typeof value === 'object' && !Array.isArray(value) && 'id' in value && 'value' in value) {
    return (value as { id: number }).id;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // Empty arrays should stay as empty arrays (not null)
    if (value.length === 0) {
      return [];
    }

    // Handle files (already in correct format from Baserow)
    if (typeof value[0] === 'object' && value[0] !== null && 'url' in value[0]) {
      return value;
    }

    // Handle array of numbers (multi-select option IDs) - check first to avoid unnecessary processing
    if (value.every((item) => typeof item === 'number')) {
      return value;
    }

    // Handle arrays that contain objects with 'id' (linked records or multi-select with {id, value} objects)
    // This also handles mixed arrays (some objects, some numbers) - extract IDs from objects
    if (value.some((item) => typeof item === 'object' && item !== null && 'id' in item)) {
      return value.map((item: any) => {
        if (typeof item === 'object' && item !== null && 'id' in item) {
          return item.id;
        }
        return item; // Already a number or other primitive
      });
    }
  }

  // Handle dates - ensure proper format
  if (fieldType === 'date' && typeof value === 'string') {
    // Baserow expects YYYY-MM-DD format
    return value;
  }

  // Handle single-select (option ID as number)
  if (typeof value === 'number') {
    return value;
  }

  // Handle primitives (string, number, boolean)
  return value;
}

/**
 * Prepare all field changes for Baserow API
 */
export function prepareUpdatePayload(changes: FieldChanges): Record<string, any> {
  const payload: Record<string, any> = {};

  for (const [fieldId, value] of Object.entries(changes)) {
    payload[fieldId] = prepareFieldValue(value);
  }

  return payload;
}

/**
 * Get user-friendly field name from field key
 */
export function getFieldLabel(fieldKey: string): string {
  // Convert field key to readable label
  // e.g., "AUM" -> "AUM", "PERSONAL_HOBBIES" -> "Personal Hobbies"
  return fieldKey
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalize select field values from Baserow format
 * Baserow returns select fields as {id, value, color} objects
 * The form components expect just the numeric ID
 */
export function normalizeSelectValue(value: FieldValue): FieldValue {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle single-select: {id, value, color} -> id
  if (typeof value === 'object' && !Array.isArray(value) && 'id' in value && 'value' in value && 'color' in value) {
    return (value as { id: number }).id;
  }

  // Handle multi-select: [{id, value, color}, ...] -> [id, ...]
  if (Array.isArray(value) && value.length > 0) {
    // Check if it's an array of select option objects (has 'color' property)
    if (value.every((item) => typeof item === 'object' && item !== null && 'id' in item && 'value' in item && 'color' in item)) {
      return value.map((item: any) => item.id);
    }
  }

  // Return other values unchanged (linked records, primitives, etc.)
  return value;
}

/**
 * Extract member ID from formula field
 * The Member ID is a formula field like "M-0001" and we want just "0001"
 */
export function extractMemberId(memberIdFormula: string): string {
  if (!memberIdFormula || typeof memberIdFormula !== 'string') return '';

  // Extract the numeric part after "M-"
  const match = memberIdFormula.match(/M-(\d+)/);
  return match ? match[1] : memberIdFormula;
}

/**
 * Get initials from a name for avatar fallback
 */
export function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // First and last name initials
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color for an avatar based on name
 */
export function getAvatarColor(name: string): string {
  if (!name) return '#94a3b8'; // slate-400

  // Hash the name to get a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to pick from a palette of nice colors
  const colors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#6366f1', // indigo-500
    '#f97316', // orange-500
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
