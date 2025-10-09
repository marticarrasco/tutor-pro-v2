# Fix Summary: Duplicate Foreign Key Constraint Resolution

## Problem
The application was throwing the following error when fetching sessions:

```
Error fetching sessions: {
  code: 'PGRST201',
  message: "Could not embed because more than one relationship was found for 'tutoring_sessions' and 'students'"
}
```

## Root Cause
The database tables had **duplicate foreign key constraints** pointing from child tables to the `students` table:

1. **tutoring_sessions** table had:
   - `tutoring_sessions_student_id_fkey` - Simple FK: `student_id` → `students(id)`
   - `tutoring_sessions_student_fk` - Composite FK: `(student_id, user_id)` → `students(id, user_id)`

2. **scheduled_classes** table had:
   - `scheduled_classes_student_id_fkey` - Simple FK: `student_id` → `students(id)`
   - `scheduled_classes_student_fk` - Composite FK: `(student_id, user_id)` → `students(id, user_id)`

When Supabase tried to join tables using the `students!inner(...)` syntax, it couldn't determine which foreign key relationship to use, causing the ambiguity error.

## Solution

### 1. Database Migration (007_fix_duplicate_foreign_keys.sql)
Created a new migration script that drops the redundant simple foreign keys, keeping only the composite foreign keys that include `user_id` for proper multi-tenant data isolation:

```sql
ALTER TABLE tutoring_sessions 
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_fkey;

ALTER TABLE scheduled_classes 
DROP CONSTRAINT IF EXISTS scheduled_classes_student_id_fkey;
```

### 2. Query Updates
Updated all Supabase queries to explicitly specify which foreign key relationship to use:

#### Files Updated:
- `app/sessions/page.tsx` - Line ~51
- `app/page.tsx` - Lines ~88 and ~283
- `app/schedule/page.tsx` - Line ~57

#### Changes Made:
**Before:**
```typescript
.select(`
  *,
  students!inner(name)
`)
```

**After:**
```typescript
// For tutoring_sessions queries
.select(`
  *,
  students!tutoring_sessions_student_fk(name)
`)

// For scheduled_classes queries
.select(`
  *,
  students!scheduled_classes_student_fk(name, hourly_rate)
`)
```

## How to Apply the Fix

1. **Run the migration script** in your Supabase SQL Editor:
   ```sql
   -- Run scripts/007_fix_duplicate_foreign_keys.sql
   ```

2. **Restart your development server** (if running):
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   # or
   pnpm dev
   ```

3. **Test the application** - The sessions page and other pages should now load without the PGRST201 error.

## Why This Works

1. **Removes Ambiguity**: By keeping only one foreign key per relationship, Supabase knows exactly which constraint to use for joins.

2. **Maintains Data Integrity**: The composite foreign keys `(student_id, user_id)` are superior because they:
   - Ensure students can only be linked to sessions/classes owned by the same user
   - Provide proper multi-tenant isolation at the database level
   - Prevent cross-user data leaks

3. **Explicit Query Syntax**: Using `students!constraint_name(...)` tells PostgREST exactly which relationship to follow, avoiding any ambiguity even if multiple constraints exist.

## Prevention

To avoid this issue in future migrations:
- Always check for existing foreign keys before adding new ones
- Drop old constraints when replacing them with new ones
- Use explicit constraint names in queries when multiple relationships might exist
