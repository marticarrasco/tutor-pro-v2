# Demo Student Directory (`/demo/students`)

## Overview
Showcases the student management workflow with mock data, allowing visitors to experiment with CRUD operations without touching production storage.

## Data & filtering
- Pulls student records from the demo context and mirrors them into local state for search filtering.
- Updates the filtered list whenever the search query or backing data changes, matching on name, email, or phone.

## CRUD interactions
- Provides an "Add student" button that opens an inline dialog populated with either blank fields or the selected student for editing.
- Validates that name and hourly rate are present before calling `addStudent` or `updateStudent` from the demo context.
- Emits success or validation toasts for every mutation and closes the dialog afterward.
- Supports student deletion through `deleteStudent`, triggering a confirmation toast when complete.

## Presentation
- Displays summary cards for total/active/inactive counts and average rate calculated from the mock dataset.
- Renders a full table with subject, grade, contact info, rate, and action buttons (edit/delete) to demonstrate the UI affordances.
- Includes the `<Toaster />` component so demo toasts appear on screen.
