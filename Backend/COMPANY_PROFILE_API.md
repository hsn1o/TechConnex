# Company Profile API Documentation

This document provides comprehensive information about the Company Profile API endpoints for testing with Postman.

## Base URL
```
http://localhost:3000/api/company/profile
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Company Profile
**GET** `/api/company/profile/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "description": "Company description",
    "industry": "Technology",
    "location": "Kuala Lumpur",
    "website": "https://example.com",
    "logoUrl": "https://example.com/logo.png",
    "socialLinks": {
      "linkedin": "https://linkedin.com/company/example",
      "twitter": "https://twitter.com/example"
    },
    "languages": ["English", "Malay"],
    "companySize": "10-50",
    "employeeCount": 25,
    "establishedYear": 2020,
    "annualRevenue": 1000000,
    "fundingStage": "Series A",
    "preferredContractTypes": ["Fixed Price", "Hourly"],
    "averageBudgetRange": "10,000 - 50,000",
    "remotePolicy": "Hybrid",
    "hiringFrequency": "Regular",
    "categoriesHiringFor": ["Web Development", "Mobile Development"],
    "mission": "Our mission statement",
    "values": ["Innovation", "Quality", "Transparency"],
    "benefits": {
      "healthInsurance": true,
      "flexibleHours": true,
      "remoteWork": true
    },
    "mediaGallery": ["url1", "url2"],
    "completion": 85,
    "user": {
      "id": "uuid",
      "email": "company@example.com",
      "name": "Company Name",
      "phone": "+60123456789",
      "kycStatus": "active",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Create Company Profile
**POST** `/api/company/profile/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "description": "We are a leading technology company specializing in web and mobile development solutions.",
  "industry": "Technology",
  "location": "Kuala Lumpur, Malaysia",
  "website": "https://example.com",
  "logoUrl": "https://example.com/logo.png",
  "socialLinks": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "https://twitter.com/example"
  },
  "languages": ["English", "Malay", "Chinese"],
  "companySize": "10-50",
  "employeeCount": 25,
  "establishedYear": 2020,
  "annualRevenue": 1000000,
  "fundingStage": "Series A",
  "preferredContractTypes": ["Fixed Price", "Hourly", "Retainer"],
  "averageBudgetRange": "10,000 - 50,000",
  "remotePolicy": "Hybrid",
  "hiringFrequency": "Regular",
  "categoriesHiringFor": ["Web Development", "Mobile Development", "AI/ML"],
  "mission": "To revolutionize the tech industry through innovative solutions",
  "values": ["Innovation", "Quality", "Transparency", "Collaboration"],
  "benefits": {
    "healthInsurance": true,
    "flexibleHours": true,
    "remoteWork": true,
    "learningBudget": 5000
  },
  "mediaGallery": [
    "https://example.com/office1.jpg",
    "https://example.com/team.jpg"
  ]
}
```

### 3. Update Company Profile
**PUT** `/api/company/profile/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (Same as create, but can be partial)

### 4. Upsert Company Profile (Create or Update)
**PATCH** `/api/company/profile/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (Same as create)

### 5. Get Profile Completion
**GET** `/api/company/profile/completion`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completion": 85
  }
}
```

### 6. Get Profile Statistics
**GET** `/api/company/profile/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "description": "...",
    "stats": {
      "projectsPosted": 15,
      "activeProjects": 3,
      "completedProjects": 12,
      "totalSpend": 150000
    }
  }
}
```

### 7. Get All Company Profiles (Public)
**GET** `/api/company/profile/all`

**Query Parameters:**
- `industry` (optional): Filter by industry
- `location` (optional): Filter by location
- `companySize` (optional): Filter by company size
- `hiringFrequency` (optional): Filter by hiring frequency
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number of results to skip (default: 0)

**Example:**
```
GET /api/company/profile/all?industry=Technology&location=Kuala%20Lumpur&limit=10
```

### 8. Search Company Profiles
**GET** `/api/company/profile/search`

**Query Parameters:**
- `q` (required): Search term
- `industry` (optional): Filter by industry
- `location` (optional): Filter by location
- `companySize` (optional): Filter by company size
- `hiringFrequency` (optional): Filter by hiring frequency
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number of results to skip (default: 0)

**Example:**
```
GET /api/company/profile/search?q=web%20development&industry=Technology&limit=10
```

### 9. Get Public Profile by ID
**GET** `/api/company/profile/public/:id`

**Example:**
```
GET /api/company/profile/public/uuid-here
```

### 10. Validate Profile Data
**POST** `/api/company/profile/validate`

**Query Parameters:**
- `update` (optional): Set to "true" if validating for update

**Headers:**
```
Content-Type: application/json
```

**Body:** (Same as create profile)

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:
- `base_url`: `http://localhost:3000/api`
- `auth_token`: Your JWT token (set after login)

### Pre-request Scripts
For authenticated endpoints, add this pre-request script:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('auth_token')
});
```

### Test Scripts
Add this test script to save auth token after login:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set('auth_token', response.token);
    }
}
```

## Sample Test Flow

1. **Login** (POST `/api/company/auth/login`)
   ```json
   {
     "email": "company@example.com",
     "password": "password123"
   }
   ```

2. **Create Profile** (POST `/api/company/profile/`)
   - Use the token from step 1
   - Send profile data

3. **Get Profile** (GET `/api/company/profile/`)
   - Verify the created profile

4. **Update Profile** (PUT `/api/company/profile/`)
   - Update some fields

5. **Get Completion** (GET `/api/company/profile/completion`)
   - Check completion percentage

6. **Search Profiles** (GET `/api/company/profile/search?q=technology`)
   - Test search functionality

## Field Validation Rules

### Required Fields:
- `description`: Minimum 10 characters
- `industry`: Required
- `location`: Required
- `companySize`: Required
- `preferredContractTypes`: Required (array)
- `averageBudgetRange`: Required
- `remotePolicy`: Required
- `hiringFrequency`: Required
- `categoriesHiringFor`: Required (array)

### Optional Fields:
- `website`: Must be valid URL if provided
- `logoUrl`: Must be valid URL if provided
- `employeeCount`: Must be between 1 and 1,000,000
- `establishedYear`: Must be between 1800 and current year
- `annualRevenue`: Cannot be negative

### Array Fields:
- `languages`: Array of strings
- `preferredContractTypes`: Array of strings
- `categoriesHiringFor`: Array of strings
- `values`: Array of strings
- `mediaGallery`: Array of URLs

### JSON Fields:
- `socialLinks`: Object with social media URLs
- `benefits`: Object with benefit details
