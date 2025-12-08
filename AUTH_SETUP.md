# Authentication Setup Complete

## Overview
JWT forwarding and Cognito session management has been implemented across the frontend.

## Components Added

### 1. `helpers/auth.js`
Utility functions for Cognito authentication:
- `getCognitoAuth()` - Retrieves JWT token, userId, and username from current session
- `isAuthenticated()` - Checks if user has valid session
- `getAuthHeaders()` - Returns Authorization header with Bearer token

### 2. `components/AuthContext.jsx`
Global authentication state management:
- **State**: `user`, `session`, `loading`, `isAuthenticated`
- **Methods**:
  - `checkAuthStatus()` - Validates current session
  - `refreshSession()` - Refreshes Cognito token
  - `logout()` - Signs out user and clears session
  - `getAuthToken()` - Returns current JWT token
  - `getUserId()` - Returns current user's sub (ID)

### 3. Updated `app/_layout.tsx`
Wrapped entire app with `AuthProvider`:
```jsx
<AuthProvider>
  <AssessmentProvider>
    <ThemeProvider>
      {/* App content */}
    </ThemeProvider>
  </AssessmentProvider>
</AuthProvider>
```

### 4. Updated `app/(tabs)/camera-welcome.jsx`
Added authentication checks and JWT forwarding:
- Checks authentication before upload (redirects to `/signin` if not authenticated)
- Adds `Authorization: Bearer <token>` header to:
  - Image upload endpoint (`/analyze/`)
  - Questionnaire submission endpoint (`/questionnaire/submit`)
- Enriches questionnaire payload with `userId` and `username`

## Authentication Flow

1. **App Launch** → `AuthProvider` checks session → Sets `isAuthenticated` state
2. **User navigates to camera-welcome** → Component checks auth status
3. **Not authenticated?** → Redirect to `/signin`
4. **Authenticated?** → Continue with upload/submission
5. **API Calls** → Include `Authorization: Bearer <jwt_token>` header

## API Request Format

### Image Upload
```javascript
POST http://192.168.31.117:8000/analyze/
Headers: {
  Authorization: Bearer eyJraWQiOiJ...,
  Content-Type: multipart/form-data
}
Body: FormData with 'file'
```

### Questionnaire Submission
```javascript
POST http://192.168.31.117:8000/questionnaire/submit
Headers: {
  Authorization: Bearer eyJraWQiOiJ...,
  Content-Type: application/json
}
Body: {
  userId: "user-sub-from-cognito",
  username: "user@example.com",
  screen1: {...},
  screen2: {...},
  screen3: {...}
}
```

## Backend Requirements

The backend must verify the JWT token on both endpoints:

```python
from fastapi import Header, HTTPException
import jwt
from jwt import PyJWKClient

COGNITO_REGION = "ap-southeast-2"
USER_POOL_ID = "ap-southeast-2_CLLyW9heK"
JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"

jwks_client = PyJWKClient(JWKS_URL)

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=None,  # Or specify your app client ID
            options={"verify_aud": False}  # Set to True if using audience
        )
        return decoded  # Contains: sub (userId), email/username, exp, etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Use in endpoints:
@app.post("/analyze/")
async def analyze_image(file: UploadFile, user_data: dict = Depends(verify_token)):
    user_id = user_data["sub"]
    # ... process image ...

@app.post("/questionnaire/submit")
async def submit_questionnaire(data: dict, user_data: dict = Depends(verify_token)):
    # Verify userId in payload matches token
    if data.get("userId") != user_data["sub"]:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    # ... process questionnaire ...
```

## Testing Checklist

- [ ] User can sign in via `/signin` screen
- [ ] Auth state persists across app restarts
- [ ] Unauthenticated users redirected from camera-welcome
- [ ] Image upload includes Authorization header
- [ ] Questionnaire submission includes Authorization header
- [ ] Backend verifies JWT and returns 401 for invalid tokens
- [ ] Backend extracts userId from JWT correctly
- [ ] Assessment history can be retrieved using userId

## Next Steps

1. **Test Frontend Flow**:
   ```bash
   npx expo start
   # Navigate through: signin → assessment → camera-welcome
   # Verify Authorization header in network logs
   ```

2. **Update Backend**:
   - Add JWT verification dependency: `pip install pyjwt[crypto] pyjwt`
   - Implement `verify_token()` function
   - Apply to both `/analyze/` and `/questionnaire/submit` endpoints
   - Store questionnaire data with userId for history retrieval

3. **Add History Feature**:
   - Create `/history/{userId}` endpoint to retrieve past assessments
   - Update `app/(tabs)/home.jsx` to display assessment history
   - Use `useAuth()` hook to get current userId

## Troubleshooting

**"Must be used within AuthProvider" error**:
- Ensure `AuthProvider` is wrapped in `app/_layout.tsx` (✅ Complete)

**401 Unauthorized errors**:
- Check JWT token is being sent: `console.log(authHeaders)` in camera-welcome.jsx
- Verify backend JWT verification is working
- Confirm Cognito session is valid: `await checkAuthStatus()`

**Token expired**:
- Call `await refreshSession()` from AuthContext
- Implement auto-refresh before API calls

**userId mismatch**:
- Ensure `getCognitoAuth()` returns correct user sub
- Verify backend extracts `sub` claim from JWT

## Files Modified
- `app/_layout.tsx` - Added AuthProvider
- `app/(tabs)/camera-welcome.jsx` - Added auth checks and JWT forwarding
- `components/AuthContext.jsx` - Created (new)
- `helpers/auth.js` - Created (new)
