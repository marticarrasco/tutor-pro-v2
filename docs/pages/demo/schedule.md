# Demo Schedule (`/demo/schedule`)

## Overview
Provides a read-only example of the weekly schedule layout using hard-coded sessions so prospective users can preview the planning UI.

## Content
- Defines a static list of mock classes with weekday, time, student, and subject.
- Iterates over every day of the week, pairing cards with the number of scheduled sessions and detailed rows when entries exist.
- Shows placeholder copy for days without appointments to demonstrate the empty-state treatment.

## Layout & tooling
- Uses `<DemoSidebar />` navigation plus `<PageHeader />` to mirror the authenticated layout and emphasise the “Weekly Schedule” context.
- Bundles a `<Toaster />` instance even though the view is read-only, keeping parity with other demo pages.
