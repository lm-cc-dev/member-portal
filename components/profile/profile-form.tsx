'use client';

import { useState, useEffect } from 'react';
import { Avatar } from './avatar';
import { ProfileSection } from './profile-section';
import {
  ReadOnlyField,
  TextField,
  DateField,
  SingleSelectField,
  MultiSelectField,
  LinkedRecordsField,
} from './fields';
import { profileConfig } from '@/lib/profile/config';
import { MemberData, LinkedRecord, FieldValue } from '@/lib/profile/types';
import { MEMBERS_FIELD_NAMES } from '@/lib/baserow/config';
import { fetchLinkedTableRecordsCached } from '@/lib/profile/linked-tables';
import { extractMemberId, normalizeSelectValue } from '@/lib/profile/utils';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialMemberData: MemberData;
}

export function ProfileForm({ initialMemberData }: ProfileFormProps) {
  const router = useRouter();
  const [memberData, setMemberData] = useState<MemberData>(initialMemberData);
  const [formData, setFormData] = useState<Record<string, FieldValue>>({});
  const [linkedTableOptions, setLinkedTableOptions] = useState<
    Record<number, LinkedRecord[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Initialize form data from member data
  useEffect(() => {
    const initialFormData: Record<string, FieldValue> = {};

    // Map Baserow field names to field keys
    Object.entries(MEMBERS_FIELD_NAMES).forEach(([key, fieldName]) => {
      const value = memberData[fieldName];
      if (value !== undefined) {
        // Normalize select field values (extract IDs from {id, value, color} objects)
        initialFormData[key] = normalizeSelectValue(value);
      }
    });

    setFormData(initialFormData);
  }, [memberData]);

  // Load linked table options
  useEffect(() => {
    async function loadLinkedTableOptions() {
      setIsLoading(true);
      const options: Record<number, LinkedRecord[]> = {};

      // Get table IDs and their display fields from config
      const tableConfigs = new Map<number, string>();
      profileConfig.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.type === 'linked-records' && field.tableId) {
            // Store the displayField for each table (use the first one found)
            if (!tableConfigs.has(field.tableId)) {
              tableConfigs.set(field.tableId, field.displayField || 'Name');
            }
          }
        });
      });

      // Fetch records for each table with correct displayField
      for (const [tableId, displayField] of tableConfigs.entries()) {
        try {
          const records = await fetchLinkedTableRecordsCached(tableId, displayField);
          options[tableId] = records;
        } catch (error) {
          console.error(`Failed to load options for table ${tableId}:`, error);
          options[tableId] = [];
        }
      }

      setLinkedTableOptions(options);
      setIsLoading(false);
    }

    loadLinkedTableOptions();
  }, []);

  // Update field value
  const updateField = (fieldKey: string, value: FieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Send formData directly - the API will handle field name mapping
      const response = await fetch('/api/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSaveMessage({
        type: 'success',
        text: result.message || 'Profile updated successfully!',
      });

      // Update member data with response
      if (result.member) {
        setMemberData(result.member);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get field value
  const getFieldValue = (fieldKey: string): FieldValue => {
    return formData[fieldKey];
  };

  // Render a field based on its configuration
  const renderField = (fieldConfig: any) => {
    const fieldValue = getFieldValue(fieldConfig.fieldKey);

    switch (fieldConfig.type) {
      case 'readonly':
        return (
          <ReadOnlyField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={fieldValue as string | number}
            description={fieldConfig.description}
          />
        );

      case 'text':
        return (
          <TextField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={(fieldValue as string) || ''}
            onChange={(value) => updateField(fieldConfig.fieldKey, value)}
            placeholder={fieldConfig.placeholder}
            description={fieldConfig.description}
            maxLength={fieldConfig.maxLength}
          />
        );

      case 'date':
        return (
          <DateField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={(fieldValue as string) || ''}
            onChange={(value) => updateField(fieldConfig.fieldKey, value)}
            description={fieldConfig.description}
          />
        );

      case 'single-select':
        return (
          <SingleSelectField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={(fieldValue as number) || null}
            onChange={(value) => updateField(fieldConfig.fieldKey, value)}
            options={fieldConfig.options}
            description={fieldConfig.description}
            otherValue={
              fieldConfig.otherFieldKey
                ? (getFieldValue(fieldConfig.otherFieldKey) as string)
                : undefined
            }
            onOtherChange={
              fieldConfig.otherFieldKey
                ? (value) => updateField(fieldConfig.otherFieldKey, value)
                : undefined
            }
            otherLabel={fieldConfig.otherLabel}
            otherOptionId={fieldConfig.otherOptionId}
          />
        );

      case 'multi-select':
        return (
          <MultiSelectField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={(fieldValue as number[]) || []}
            onChange={(value) => updateField(fieldConfig.fieldKey, value)}
            options={fieldConfig.options}
            description={fieldConfig.description}
          />
        );

      case 'linked-records':
        const options = linkedTableOptions[fieldConfig.tableId] || [];
        return (
          <LinkedRecordsField
            key={fieldConfig.fieldKey}
            label={fieldConfig.label}
            value={(fieldValue as LinkedRecord[]) || []}
            onChange={(value) => updateField(fieldConfig.fieldKey, value)}
            options={options}
            description={fieldConfig.description}
            multiple={fieldConfig.multiple}
            otherValue={
              fieldConfig.otherFieldKey
                ? (getFieldValue(fieldConfig.otherFieldKey) as string)
                : undefined
            }
            onOtherChange={
              fieldConfig.otherFieldKey
                ? (value) => updateField(fieldConfig.otherFieldKey, value)
                : undefined
            }
            otherLabel={fieldConfig.otherLabel}
            hasOther={fieldConfig.hasOther}
          />
        );

      default:
        return null;
    }
  };

  // Extract member info for header
  const memberName = (formData.NAME as string) || 'Member';
  const memberIdRaw = formData.MEMBER_ID as string;
  const memberId = extractMemberId(memberIdRaw);
  const headshot = formData.HEADSHOT as any;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with Avatar and Name */}
      <div className="text-center">
        <Avatar name={memberName} headshot={headshot} size="xl" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{memberName}</h1>
        {memberId && (
          <p className="mt-1 text-sm text-gray-500">Member #{memberId}</p>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading profile data...</p>
        </div>
      )}

      {/* Profile Sections */}
      {!isLoading &&
        profileConfig.sections.map((section) => (
          <ProfileSection
            key={section.id}
            title={section.title}
            description={section.description}
          >
            {section.fields.map((field) => renderField(field))}
          </ProfileSection>
        ))}

      {/* Submit Button */}
      {!isLoading && (
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
}
