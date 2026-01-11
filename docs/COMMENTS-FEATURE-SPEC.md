# Comments Feature Specification

This document contains implementation instructions for the deal comments/feed feature. This is designed to be implemented in a separate Claude session.

---

## Overview

Add a comments/feed functionality to the Deal Detail Page (`/deals/[id]`) allowing members to discuss deals, ask questions, and share insights.

---

## Data Model

### Option A: Baserow Table (Recommended for consistency)

**Create "Deal Comments" table (new) with fields:**

| Field Name | Type | Description |
|------------|------|-------------|
| Comment ID | Formula | Auto-generated (e.g., DC-0001) |
| Deal | Link to Deals (756) | Which deal this comment belongs to |
| Member | Link to Members (347) | Who wrote the comment |
| Content | Long text | The comment text |
| Created At | Created on | Auto timestamp |
| Updated At | Last modified | Auto timestamp |
| Parent Comment | Link to Deal Comments (self) | For threaded replies (optional) |
| Is Pinned | Boolean | Admin can pin important comments |

### Option B: Postgres Table (Better for real-time)

```sql
CREATE TABLE deal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id INTEGER NOT NULL,  -- Baserow deal row ID
  member_id INTEGER NOT NULL,  -- Baserow member row ID
  user_id TEXT NOT NULL REFERENCES user(id),  -- Postgres user
  content TEXT NOT NULL,
  parent_id UUID REFERENCES deal_comments(id),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Routes

### `GET /api/deals/[id]/comments`
Fetch comments for a deal, ordered by created_at DESC.

**Response:**
```typescript
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  member: {
    id: number;
    name: string;
    headshot?: string;
  };
  replies?: Comment[];  // If threaded
}
```

### `POST /api/deals/[id]/comments`
Create a new comment.

**Request:**
```typescript
{
  content: string;
  parentId?: string;  // For replies
}
```

### `PATCH /api/deals/[id]/comments/[commentId]`
Edit own comment (within time limit?).

### `DELETE /api/deals/[id]/comments/[commentId]`
Delete own comment (soft delete recommended).

---

## Components

### `/components/deals/comments-section.tsx`
Main container component:
- Heading with comment count
- New comment form (if authenticated)
- List of comments
- Load more / pagination

### `/components/deals/comment-card.tsx`
Individual comment display:
- Member avatar + name
- Timestamp (relative: "2 hours ago")
- Comment content
- Actions: Reply, Edit (own), Delete (own)
- Pinned indicator

### `/components/deals/comment-form.tsx`
Form for new comments/replies:
- Textarea with character limit
- Submit button with loading state
- Cancel button (for replies)

---

## UI Design

Follow existing portal patterns:

```tsx
<section className="space-y-6">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold flex items-center gap-2">
      <MessageSquare className="w-5 h-5 text-primary" />
      Comments
      <Badge variant="secondary" className="ml-2">
        {commentCount}
      </Badge>
    </h2>
  </div>

  {/* New Comment Form */}
  <Card>
    <CardContent className="pt-4">
      <CommentForm dealId={dealId} onSubmit={handleNewComment} />
    </CardContent>
  </Card>

  {/* Comments List */}
  <div className="space-y-4">
    {comments.map(comment => (
      <CommentCard key={comment.id} comment={comment} />
    ))}
  </div>

  {/* Empty State */}
  {comments.length === 0 && (
    <Empty>
      <EmptyMedia variant="icon">
        <MessageSquare />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Start the conversation</EmptyTitle>
        <EmptyDescription>
          Be the first to comment on this deal.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )}
</Card>
```

**Comment Card Layout:**
```tsx
<Card className="p-4">
  <div className="flex gap-3">
    <Avatar size="sm" name={member.name} src={member.headshot} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{member.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(createdAt)}
        </span>
        {isPinned && (
          <Badge variant="outline" className="text-xs">
            <Pin className="w-3 h-3 mr-1" />
            Pinned
          </Badge>
        )}
      </div>
      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
        {content}
      </p>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" size="xs">Reply</Button>
        {isOwn && <Button variant="ghost" size="xs">Edit</Button>}
      </div>
    </div>
  </div>
</Card>
```

---

## Features to Consider

### MVP (Phase 1)
- [x] View comments on a deal
- [x] Add new comment
- [x] Member avatar + name display
- [x] Relative timestamps

### Enhanced (Phase 2)
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Reply to comments (threaded)
- [ ] Pin important comments (admin only)

### Advanced (Phase 3)
- [ ] Real-time updates (WebSocket or polling)
- [ ] @mentions with notifications
- [ ] Rich text / markdown support
- [ ] File attachments
- [ ] Emoji reactions

---

## Security Considerations

1. **Authentication:** All comment actions require authenticated session
2. **Authorization:**
   - Only comment author can edit/delete their own comments
   - Admin can pin/unpin any comment
   - Consider: Should comments require NDA signed? (Probably yes for deal-specific discussions)
3. **Validation:**
   - Content length limits
   - Rate limiting (prevent spam)
   - XSS prevention (sanitize content)
4. **Privacy:**
   - Member names visible only to other members
   - Comments tied to deals (not publicly accessible)

---

## Integration Points

### Current Placeholder Location
The comments section placeholder is in:
`/components/deals/deal-detail-content.tsx`

```tsx
{/* Comments Section (Placeholder) */}
<section className="space-y-6">
  <h2 className="text-lg font-semibold flex items-center gap-2">
    <MessageSquare className="w-5 h-5 text-primary" />
    Comments
  </h2>

  <Card>
    <CardContent className="py-8">
      <Empty>
        <EmptyTitle>No comments yet</EmptyTitle>
        <EmptyDescription>Comments feature coming soon.</EmptyDescription>
      </Empty>
    </CardContent>
  </Card>
</section>
```

Replace this placeholder with the actual CommentsSection component.

---

## Testing Checklist

- [ ] Unauthenticated user cannot comment
- [ ] Member can view comments on deals they have access to
- [ ] Member can post new comment
- [ ] Comment appears immediately after posting
- [ ] Member can only edit/delete their own comments
- [ ] Empty state shows when no comments
- [ ] Loading state while fetching comments
- [ ] Error handling for failed operations
- [ ] Comments sorted correctly (newest first or oldest first)
- [ ] Mobile responsive layout

---

## File Structure

```
/lib/comments/
  index.ts          # Data fetching functions
  types.ts          # Comment interfaces

/components/deals/
  comments-section.tsx    # Main container
  comment-card.tsx        # Single comment display
  comment-form.tsx        # New comment form

/app/api/deals/[id]/comments/
  route.ts                # GET, POST handlers
  [commentId]/
    route.ts              # PATCH, DELETE handlers
```
