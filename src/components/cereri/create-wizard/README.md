# Create Cerere Multi-Step Wizard

Complete implementation of the multi-step wizard for creating new cereri (requests) in the primariata.work platform.

## Overview

This wizard guides users through a 4-step process to create and submit administrative requests to their local government:

1. **Select Tip Cerere** - Choose the type of request
2. **Fill Details** - Complete required form fields
3. **Upload Documents** - Add necessary supporting documents
4. **Review & Submit** - Verify and submit the request

## Components

### WizardLayout

Wrapper component providing visual progress tracking and step indicators.

**Features:**

- Progress bar showing completion percentage
- Step-by-step visual indicators
- Responsive design (mobile + desktop)

### SelectTipCerere

Grid display of available request types with search functionality.

**Features:**

- Card-based layout with type details (taxa, termen, departament)
- Search/filter by name, code, or department
- Loading and error states
- Selection highlighting

### FillDetails

Dynamic form builder based on selected tip_cerere configuration.

**Features:**

- Dynamic field rendering from JSONB schema
- Support for: text, textarea, number, date, select, checkbox, radio
- Zod validation with custom rules
- Auto-save (debounced every 2 seconds)
- Manual "Save Draft" option
- Form state persistence

### UploadDocuments

Drag-and-drop document upload with validation.

**Features:**

- Drag-and-drop zone (react-dropzone)
- File type validation (PDF, JPG, PNG, DOC, DOCX)
- Size limits: 10MB per file, 50MB total
- Upload progress tracking
- Preview uploaded files
- Delete uploaded files
- Required documents checklist

### ReviewSubmit

Final review and submission step with summary display.

**Features:**

- Summary of selected tip_cerere
- Display all form data
- List of uploaded documents
- Edit buttons to jump back to previous steps
- Terms acceptance checkbox
- Estimated completion date calculation
- Important notices and instructions

## State Management

### useWizardState Hook

Custom hook managing wizard state with localStorage persistence.

**Features:**

- Persists state across page refreshes
- Auto-save to localStorage (debounced 500ms)
- Hydration-safe (prevents SSR mismatch)
- State includes:
  - Current step
  - Selected tip_cerere
  - Form data
  - Observatii (notes)
  - Uploaded files
  - Draft ID
  - Last saved timestamp

**API:**

```typescript
const {
  state,
  isHydrated,
  setCurrentStep,
  setSelectedTipCerere,
  setFormData,
  setObservatii,
  setUploadedFiles,
  setDraftId,
  clearState,
  goToNextStep,
  goToPreviousStep,
  goToStep,
} = useWizardState();
```

## API Integration

### Endpoints Used

**GET /api/tipuri-cereri**

- Fetch available request types
- Filters to active types only

**POST /api/cereri**

- Create new draft cerere
- Payload: `{ tip_cerere_id, date_formular, observatii_solicitant }`
- Returns: `{ id, numar_inregistrare, ... }`

**PATCH /api/cereri/[id]**

- Update draft cerere
- Payload: `{ date_formular?, observatii_solicitant? }`

**POST /api/cereri/[id]/documents**

- Upload document for cerere
- Form data: `file`, `cerere_id`
- Returns: `{ storage_path, ... }`

**POST /api/cereri/[id]/submit**

- Submit cerere for processing
- Transitions from draft to "depusa" status
- Returns: `{ numar_inregistrare, ... }`

## Data Flow

```
1. User selects tip_cerere
   → Update wizard state
   → Navigate to step 2

2. User fills form details
   → Auto-save every 2s (debounced)
   → Manual save → POST/PATCH /api/cereri
   → Store draft_id in state
   → Navigate to step 3

3. User uploads documents
   → Validate file type and size
   → Upload to Supabase Storage
   → POST /api/cereri/[id]/documents
   → Track upload progress
   → Navigate to step 4

4. User reviews and submits
   → Display summary
   → Accept terms
   → POST /api/cereri/[id]/submit
   → Clear wizard state
   → Redirect to /cereri
```

## File Structure

```
src/components/cereri/create-wizard/
├── SelectTipCerere.tsx       # Step 1: Type selection
├── FillDetails.tsx            # Step 2: Form filling
├── UploadDocuments.tsx        # Step 3: Document upload
├── ReviewSubmit.tsx           # Step 4: Review and submit
├── WizardLayout.tsx           # Wrapper with progress UI
├── index.ts                   # Exports
└── README.md                  # This file

src/types/
└── wizard.ts                  # Wizard-specific types

src/hooks/
└── use-wizard-state.ts        # State management hook

src/app/app/[judet]/[localitate]/cereri/nou/
└── page.tsx                   # Main wizard page
```

## Types

### WizardStep

```typescript
enum WizardStep {
  SELECT_TYPE = 0,
  FILL_DETAILS = 1,
  UPLOAD_DOCUMENTS = 2,
  REVIEW_SUBMIT = 3,
}
```

### WizardState

```typescript
interface WizardState {
  currentStep: WizardStep;
  selectedTipCerere?: TipCerere;
  formData: Record<string, unknown>;
  observatii?: string;
  uploadedFiles: UploadedFile[];
  draftId?: string;
  lastSaved?: string;
}
```

### UploadedFile

```typescript
interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploadProgress: number;
  uploaded: boolean;
  storageUrl?: string;
  error?: string;
}
```

### DynamicFormField

```typescript
interface DynamicFormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
```

## Validation

### Form Validation

- Dynamic Zod schemas built from `campuri_formular` JSONB
- Field-level validation rules
- Required field enforcement
- Pattern matching (regex)
- Min/max constraints

### File Validation

- Accepted types: PDF, JPG, PNG, DOC, DOCX
- Max size per file: 10MB
- Max total size: 50MB
- Required documents enforcement

### Submission Validation

- All required fields completed
- All required documents uploaded
- Terms and conditions accepted

## Error Handling

**Network Errors:**

- Toast notifications for API failures
- Retry mechanisms for uploads
- Error state display in upload list

**Validation Errors:**

- Inline form field errors
- File validation messages
- Submission blocking with clear messaging

**State Recovery:**

- Automatic state persistence to localStorage
- Recovery after page refresh or crash
- State cleared after successful submission

## Accessibility

- Semantic HTML structure
- ARIA labels for form fields
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages
- Sufficient color contrast (AA compliance)

## Performance

**Optimizations:**

- Debounced auto-save (2s delay)
- Lazy loading of form components
- Optimistic UI updates
- File upload progress tracking
- Minimal re-renders with React.memo

**Bundle Size:**

- react-dropzone: ~14KB gzipped
- Form components: code-split per step
- Total wizard bundle: ~45KB gzipped

## Testing Checklist

### Step 1: Select Tip Cerere

- [ ] Grid displays all active tipuri_cereri
- [ ] Search filters by name, cod, departament
- [ ] Card shows taxa, termen, descriere
- [ ] Selection highlights card
- [ ] Click navigates to step 2

### Step 2: Fill Details

- [ ] Dynamic fields render based on campuri_formular
- [ ] Validation works for all field types
- [ ] Auto-save creates/updates draft
- [ ] Manual save button works
- [ ] Observatii textarea limited to 1000 chars
- [ ] Back button returns to step 1

### Step 3: Upload Documents

- [ ] Drag-and-drop works
- [ ] File type validation works
- [ ] Size validation (10MB/file, 50MB total)
- [ ] Upload progress displays
- [ ] Delete file works
- [ ] Required documents enforced
- [ ] Back button preserves uploaded files

### Step 4: Review Submit

- [ ] Summary shows all entered data
- [ ] Edit buttons jump to correct step
- [ ] Uploaded files listed
- [ ] Taxa and termen displayed
- [ ] Terms checkbox required
- [ ] Submit creates final cerere
- [ ] Success redirects to /cereri
- [ ] State cleared after submit

## Future Enhancements

1. **Autosave Indicator**
   - Visual feedback when draft saves
   - "Last saved at XX:XX" timestamp

2. **Multi-file Upload**
   - Batch upload support
   - Parallel upload processing

3. **Document Preview**
   - In-browser PDF preview
   - Image preview thumbnails

4. **Draft Management**
   - List saved drafts
   - Resume incomplete cereri
   - Delete old drafts

5. **Accessibility Improvements**
   - Keyboard shortcuts for navigation
   - Screen reader announcements
   - High contrast mode

6. **Analytics**
   - Track completion rate per step
   - Identify drop-off points
   - A/B test form layouts

## Dependencies

```json
{
  "react-hook-form": "^7.65.0",
  "zod": "^4.1.12",
  "@hookform/resolvers": "^3.9.1",
  "react-dropzone": "^14.3.8",
  "sonner": "^2.0.7"
}
```

## Notes

- Wizard state persists in localStorage with key `cerere_wizard_state`
- State cleared on successful submission to prevent duplicate cereri
- File previews use `URL.createObjectURL` (revoked on file delete)
- Draft auto-save prevents data loss during crashes
- Supabase Storage used for document uploads
- RLS policies ensure users only see their own drafts

---

**Implementation Date:** 2025-12-28
**Issue:** #72
**Milestone:** M2 - Cereri Module MVP
