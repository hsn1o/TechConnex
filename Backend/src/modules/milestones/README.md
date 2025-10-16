# Milestone Negotiation System (Option A)

This system implements milestone negotiation between companies and providers for accepted proposals.

## Overview

The milestone negotiation system allows companies and providers to collaborate on finalizing project milestones before work begins. This happens after a proposal is accepted but before the project is fully activated.

## Database Schema Changes

Added to `ServiceRequest` model:
```prisma
// Milestone negotiation fields (Option A)
milestoneDraft            Json?
milestoneDraftVersion     Int       @default(0)
milestoneCompanyAccepted  Boolean   @default(false)
milestoneProviderAccepted Boolean   @default(false)
```

## Flow

1. **Provider submits proposal** with milestones
2. **Company accepts proposal** → milestones copied to `ServiceRequest.milestoneDraft`, version = 1, both flags = false
3. **Company can edit milestones** → `milestoneCompanyAccepted = true`, `milestoneProviderAccepted = false`, version++
4. **Provider reviews** → can confirm or edit:
   - **Confirm** → `milestoneProviderAccepted = true`
   - **Edit** → `milestoneProviderAccepted = true`, `milestoneCompanyAccepted = false`, version++
5. **Repeat until both confirm** → finalize to Project

## API Endpoints

### Company Milestones (`/api/company/milestones`)

- `GET /:serviceRequestId` - Get milestone draft
- `POST /:serviceRequestId` - Save milestone draft (company)
- `POST /:serviceRequestId/confirm` - Confirm milestones (company)

### Provider Milestones (`/api/provider/milestones`)

- `GET /:serviceRequestId` - Get milestone draft
- `POST /:serviceRequestId` - Save milestone draft (provider)
- `POST /:serviceRequestId/confirm` - Confirm milestones (provider)

## Milestone Object Structure

```typescript
type Milestone = {
  sequence: number;           // 1..N unique
  title: string;
  description?: string;
  amount: number;             // > 0
  dueDate: string;            // ISO 8601 date
};
```

## Validation Rules

- `milestones.length >= 1` and `<= 20`
- `sequence` numbers are 1..N, unique, and consecutive
- Every item: `title` non-empty, `amount > 0`, `dueDate` valid ISO date
- Optional: Sum of amounts equals proposal bid amount (±5% tolerance)

## Authorization

- **Company endpoints**: Ensure `ServiceRequest.customerId === req.user.userId`
- **Provider endpoints**: Ensure the accepted proposal belongs to `req.user.userId`

## Response Format

All endpoints return:
```json
{
  "success": true|false,
  "milestones": [...],
  "milestoneDraftVersion": 3,
  "milestoneCompanyAccepted": true,
  "milestoneProviderAccepted": false,
  "finalized": true|false,  // Only on confirm
  "project": {...}          // Only when finalized
}
```

## Integration

The system integrates with existing modules:
- `company/project-requests` - Modified to copy provider milestones on accept
- `provider/send-proposal` - Provider submits milestones with proposal
- `company/projects` - Finalized milestones copied to Project

## Testing

Run the test files to verify the structure:
```bash
node src/modules/company/milestones/test.js
node src/modules/provider/milestones/test.js
```

## Configuration

- `AMOUNT_TOLERANCE_PERCENT = 5` - Tolerance for milestone sum vs proposal amount
- Maximum 20 milestones per project
- Sequence numbers must be consecutive starting from 1
