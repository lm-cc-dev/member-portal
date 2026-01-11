'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Users, Download, FileText } from 'lucide-react';
import { formatRelativeTime } from './utils';
import type { CommentAuthor } from './types';

interface CommentDocument {
  name: string;
  url: string;
}

interface CommentCardProps {
  id: number;
  author: CommentAuthor;
  commentText: string;
  createdDate: string;
  lastUpdated?: string;
  isOwn: boolean;
  isAnonymous?: boolean;
  steercoOnly?: boolean;
  isTargeted?: boolean;
  documents?: CommentDocument[];
  variant?: 'default' | 'samira' | 'steerco';
  onEdit?: (id: number, newText: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CommentCard({
  id,
  author,
  commentText,
  createdDate,
  lastUpdated,
  isOwn,
  isAnonymous = false,
  steercoOnly = false,
  isTargeted = false,
  documents = [],
  variant = 'default',
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(commentText);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!onEdit || !editText.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(id, editText.trim());
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setIsSubmitting(true);
    try {
      await onDelete(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wasEdited = lastUpdated && lastUpdated !== createdDate;

  // Display name: "You" for own comments, author name otherwise
  const displayName = isOwn ? 'You' : (variant === 'samira' ? 'Samira' : author.name);

  // Variant-specific styling (own comments get a subtle highlight)
  const variantStyles = {
    default: isOwn ? 'border-l-4 border-l-primary/50 bg-primary/5' : '',
    samira: 'border-l-4 border-l-primary bg-primary/5',
    steerco: 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20',
  };

  return (
    <Card size="sm" className={variantStyles[variant]}>
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar size="sm">
            {isAnonymous ? (
              <AvatarFallback>
                <EyeOff className="size-3" />
              </AvatarFallback>
            ) : (
              <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(createdDate)}
                {wasEdited && ' (edited)'}
              </span>

              {/* Badges */}
              {steercoOnly && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="size-3 mr-1" />
                  SteerCo Only
                </Badge>
              )}
              {isTargeted && variant === 'samira' && (
                <Badge variant="outline" className="text-xs">
                  For You
                </Badge>
              )}

              {/* Actions menu */}
              {isOwn && (onEdit || onDelete) && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-7 p-0">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isSubmitting || !editText.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(commentText);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {commentText}
              </p>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <div className="mt-3 space-y-1">
                {documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="size-4" />
                    <span>{doc.name}</span>
                    <Download className="size-3 ml-auto opacity-50" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
