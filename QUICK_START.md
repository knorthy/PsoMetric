# Quick Start Guide - Testing the Frontend

## ✅ Frontend Complete - Ready to Test!

The assessment data collection system is fully implemented. Here's how to test it:

---

## 1. Test Without Backend (Recommended First)

### Add Mock Response
Open `app/(tabs)/camera-welcome.jsx` and find the questionnaire submission section (around line 95-125).

**Temporarily add this BEFORE the actual fetch:**

```javascript
// TEMPORARY MOCK FOR TESTING - Remove when backend is ready
const questionnaireData = getFullQuestionnaire();
console.log("📋 Questionnaire Data:", JSON.stringify(questionnaireData, null, 2));

// Mock response instead of real API call
const questionnaireResponse = {
  assessment_id: "mock-test-123",
  timestamp: new Date().toISOString(),
  severity_assessment: "moderate",
  psoriatic_arthritis_risk: "high",
  nextSteps: [
    "Schedule appointment with dermatologist for comprehensive evaluation within 2-4 weeks",
    "Consider switching to combination therapy (topical corticosteroid + vitamin D analog)",
    "Consult rheumatologist due to joint pain with nail involvement - possible psoriatic arthritis",
    "Implement stress management techniques (meditation, yoga) as stress is a major trigger",
    "Avoid alcohol consumption which may worsen symptoms and reduce treatment effectiveness",
    "Document symptom patterns in a daily journal to identify additional triggers",
    "Consider phototherapy if topical treatments remain ineffective after 8-12 weeks"
  ],
  additionalNotes: "Based on your symptoms, particularly the combination of nail changes and joint pain, there's a significant risk of psoriatic arthritis. Early intervention is crucial. Your current treatment may be insufficient for your symptom severity. A dermatologist can prescribe stronger medications or recommend systemic treatments.",
  treatment_urgency: "medium",
  recommended_followup_weeks: 4
};

// Skip the real API call for now
// const questionnaireResult = await fetch(...);

// Comment out or skip the real fetch block
```

### Run the App

```powershell
# Start Expo
npm start

# Or for Android
npm run android

# Or for iOS
npm run ios
```

---

## 2. Test Flow

### Step-by-Step Testing

1. **Open Assessment Tab** (Screen 1)
   - Fill out gender, age, psoriasis history
   - Select locations, appearance, size, etc.
   - Tap FAB (forward arrow) button

2. **Screen 2** should open with empty form
   - Fill out onset date, symptom pattern
   - Adjust severity sliders (itching, burning, pain)
   - Select triggers
   - Tap FAB button

3. **Screen 3** should open with empty form
   - Fill out daily impact, emotional impact
   - Joint pain questions
   - Medical history
   - Tap FAB button

4. **Camera Screen** opens
   - Upload a test image (any image works)
   - Watch console logs - should see questionnaire data
   - Should navigate to Results

5. **Results Screen** displays:
   - ✅ Mock GenAI recommendations should appear
   - ✅ "🤖 AI-Generated Next Steps" section
   - ✅ All 7 recommendations listed
   - ✅ Additional notes displayed

---

## 3. Test Data Persistence

### Exit Mid-Assessment Test

1. Fill out Screen 1 completely
2. Navigate to Screen 2, fill it halfway
3. **Close the app completely** (force quit)
4. Reopen the app
5. Navigate back to assessment tabs
6. ✅ Screen 1 should have all your previous data
7. ✅ Screen 2 should have your partial data

### Data Clearance Test

1. Complete full assessment (all 3 screens + image)
2. View results
3. Go back to assessment screens
4. ✅ All fields should be empty (data cleared after submission)

---

## 4. Check AsyncStorage (Debugging)

### Install React Native Debugger or use Expo Dev Tools

```javascript
// In any assessment screen, add this temporarily:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this in a useEffect:
useEffect(() => {
  AsyncStorage.getItem('@psometric_assessment').then(data => {
    console.log('Saved Assessment Data:', JSON.parse(data));
  });
}, []);
```

---

## 5. Console Log Checks

Watch for these logs when testing:

### On App Start:
```
✅ Assessment data restored from storage
```

### On Navigation (FAB button press):
```
(No specific log, but data saves to AsyncStorage)
```

### On Camera Screen Image Upload:
```
🚀 Uploading to: http://192.168.31.117:8000/analyze/
📋 Submitting questionnaire data...
✅ Questionnaire submitted successfully
```

### On Result Screen:
```
(Check if recommendations render correctly)
```

---

## 6. Common Issues & Fixes

### Issue: "useAssessment must be used within AssessmentProvider"
**Fix:** `_layout.tsx` must wrap app with `<AssessmentProvider>`

### Issue: Data not persisting
**Fix:** Check if AsyncStorage is installed: `npm install @react-native-async-storage/async-storage`

### Issue: Navigation not working
**Fix:** Ensure router.push() paths match your file structure: `/assess2`, `/assess3`, `/camera-welcome`

### Issue: Mock recommendations not showing
**Fix:** Ensure you're passing mock response correctly in camera-welcome.jsx

---

## 7. Backend Integration (When Ready)

Once backend is ready, remove the mock code and uncomment:

```javascript
// In camera-welcome.jsx
const questionnaireResult = await fetch(QUESTIONNAIRE_SUBMIT_URL, {
  method: 'POST',
  body: JSON.stringify(questionnaireData),
  headers: {
    'Content-Type': 'application/json',
  },
});

if (questionnaireResult.ok) {
  const questionnaireText = await questionnaireResult.text();
  questionnaireResponse = JSON.parse(questionnaireText);
  console.log("✅ Questionnaire submitted successfully");
  await resetAssessment();
}
```

---

## 8. Backend Checklist

Before connecting to real backend, ensure:

- [ ] Backend running at `http://192.168.31.117:8000`
- [ ] `/questionnaire/submit` endpoint implemented
- [ ] Accepts POST with JSON body
- [ ] Returns response with `nextSteps` array
- [ ] CORS enabled for React Native requests

---

## 9. Production Checklist

Before deploying:

- [ ] Remove all console.log statements
- [ ] Remove mock data code
- [ ] Use production backend URL (not localhost/IP)
- [ ] Add proper error boundaries
- [ ] Test on both iOS and Android
- [ ] Add loading indicators
- [ ] Test offline behavior

---

## 10. Files to Check

All these files have been modified/created:

```
✅ components/AssessmentContext.jsx (NEW)
✅ app/_layout.tsx (MODIFIED)
✅ app/(tabs)/assessment.jsx (MODIFIED)
✅ app/(tabs)/assess2.jsx (MODIFIED)
✅ app/(tabs)/assess3.jsx (MODIFIED)
✅ app/(tabs)/camera-welcome.jsx (MODIFIED)
✅ app/(tabs)/result.jsx (MODIFIED)
```

---

## 11. Expected Behavior

### ✅ Assessment Flow
- User fills 3 screens sequentially
- Data persists if app closes
- Data submits to backend after image upload
- Results show GenAI recommendations

### ✅ Data Management
- Auto-save to AsyncStorage
- Auto-restore on app restart
- Auto-clear after successful submission

### ✅ Error Handling
- Graceful failure if backend unavailable
- Image analysis still works independently
- User sees partial results if needed

---

## Need Help?

- **Frontend issues**: Check console logs, verify AsyncStorage
- **Backend issues**: See `BACKEND_PLAN.md` for implementation
- **Integration issues**: Verify API endpoints and response format

Frontend is complete and ready! Test with mock data first, then connect to backend. 🚀
