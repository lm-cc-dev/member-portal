/**
 * Types for deal comments components
 */

export interface CommentAuthor {
  id: number | null;
  name: string;
}

export interface MemberComment {
  id: number;
  commentText: string;
  documents: any[];
  isAnonymous: boolean;
  steercoOnly: boolean;
  createdDate: string;
  lastUpdated: string;
  author: CommentAuthor;
  isOwn: boolean;
}

export interface SamiraComment {
  id: number;
  commentText: string;
  documents: any[];
  createdDate: string;
  lastUpdated: string;
  isTargeted: boolean;
  targetMemberCount: number;
}

export interface SteerCoComment {
  id: number;
  commentText: string;
  documents: any[];
  createdDate: string;
  lastUpdated: string;
  author: CommentAuthor;
  isOwn: boolean;
}

export interface CommentsSectionProps {
  dealId: number;
  currentMemberId: number;
  isSteerCoMember: boolean;
  isAdmin: boolean;
}
