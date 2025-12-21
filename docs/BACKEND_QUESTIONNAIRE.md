# Backend Plan: Add Questionnaire Endpoint to Existing Backend

## Overview
Code snippets to add questionnaire data collection to your **existing FastAPI backend**. This handles the assessment form data separately from your existing image analysis endpoint.

---

## 1. Endpoint Specification

### URL
```
POST http://192.168.31.117:8000/questionnaire/submit
```

### Request Format
```json
{
  "timestamp": "2025-12-07T10:30:00.000Z",
  "screen1": {
    "gender": "Female",
    "age": "28",
    "psoriasisHistory": "recurrent",
    "location": ["scalp", "elbows", "knees"],
    "appearance": ["red", "scaly", "silvery"],
    "size": ["coin", "palm"],
    "nails": ["pitting", "ridges"],
    "scalp": ["flaking", "itching"]
  },
  "screen2": {
    "onsetDate": "2 weeks ago",
    "symptomPattern": "intermittent",
    "lesionSpeed": "gradual",
    "itching": 7,
    "burning": 4,
    "pain": 3,
    "bleeding": 2,
    "worsenAtNight": "yes",
    "worsenWithStress": "yes",
    "triggers": ["stress", "cold", "alcohol"],
    "medTriggers": ["strep"],
    "sunlightEffect": "winter"
  },
  "screen3": {
    "dailyImpact": "moderate",
    "emotionalImpact": "sometimes",
    "relationshipsImpact": "some",
    "jointPain": "yes",
    "jointsAffected": ["fingers", "knees"],
    "nailWithJoint": "yes",
    "pastTreatments": "Topical steroids for 3 months",
    "familyHistory": ["psoriasis"],
    "otherConditions": ["obesity"],
    "currentTreatment": "Coal tar shampoo",
    "reliefSideEffects": "Minimal relief, scalp still itchy",
    "triedSystemic": "no",
    "feverInfection": "no",
    "weightLossFatigue": "no"
  }
}
```

### Response Format
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T10:30:00.000Z",
  "severity_assessment": "moderate",
  "psoriatic_arthritis_risk": "high",
  "nextSteps": [
    "Schedule appointment with dermatologist for comprehensive evaluation",
    "Consider switching to combination therapy (topical corticosteroid + vitamin D analog)",
    "Consult rheumatologist due to joint pain with nail involvement",
    "Implement stress management techniques as stress is a major trigger",
    "Avoid alcohol consumption which may worsen symptoms",
    "Document symptom patterns in a daily journal",
    "Consider phototherapy if topical treatments remain ineffective"
  ],
  "additionalNotes": "Based on your symptoms, particularly the combination of nail changes and joint pain, there's a significant risk of psoriatic arthritis. Early intervention is crucial.",
  "treatment_urgency": "medium",
  "recommended_followup_weeks": 4
}
```

---

## 2. Add to Your Existing Backend

### Step 1: Add Pydantic Models
Add these models to your existing code (e.g., in `models.py` or at the top of your main file):

```python
from pydantic import BaseModel
from typing import List
import uuid

class Screen1(BaseModel):
    gender: str
    age: str
    psoriasisHistory: str
    location: List[str]
    appearance: List[str]
    size: List[str]
    nails: List[str]
    scalp: List[str]

class Screen2(BaseModel):
    onsetDate: str
    symptomPattern: str
    lesionSpeed: str
    itching: int
    burning: int
    pain: int
    bleeding: int
    worsenAtNight: str
    worsenWithStress: str
    triggers: List[str]
    medTriggers: List[str]
    sunlightEffect: str

class Screen3(BaseModel):
    dailyImpact: str
    emotionalImpact: str
    relationshipsImpact: str
    jointPain: str
    jointsAffected: List[str]
    nailWithJoint: str
    pastTreatments: str
    familyHistory: List[str]
    otherConditions: List[str]
    currentTreatment: str
    reliefSideEffects: str
    triedSystemic: str
    feverInfection: str
    weightLossFatigue: str

class QuestionnaireRequest(BaseModel):
    timestamp: str
    screen1: Screen1
    screen2: Screen2
    screen3: Screen3

class QuestionnaireResponse(BaseModel):
    assessment_id: str
    timestamp: str
    severity_assessment: str
    psoriatic_arthritis_risk: str
    nextSteps: List[str]
    additionalNotes: str
    treatment_urgency: str
    recommended_followup_weeks: int
```

---

### Step 2: Add Helper Functions
Add these assessment logic functions:

```python
def assess_severity(data: QuestionnaireRequest) -> str:
    """Assess psoriasis severity based on questionnaire data."""
    screen1 = data.screen1
    screen2 = data.screen2
    
    location_count = len(screen1.location)
    size = screen1.size
    avg_symptom_severity = (screen2.itching + screen2.burning + screen2.pain) / 3
    
    if "widespread" in size or location_count >= 5:
        return "severe"
    elif location_count >= 3 or "palm" in size:
        return "moderate" if avg_symptom_severity >= 5 else "mild"
    else:
        return "moderate" if avg_symptom_severity >= 7 else "mild"

def assess_psa_risk(screen3: Screen3) -> str:
    """Assess Psoriatic Arthritis risk."""
    joint_pain = screen3.jointPain == "yes"
    has_nail_changes = len(screen3.nails) > 0
    nail_with_joint = screen3.nailWithJoint == "yes"
    
    if joint_pain and nail_with_joint:
        return "high"
    elif joint_pain or has_nail_changes:
        return "medium"
    else:
        return "low"

def generate_recommendations(data: QuestionnaireRequest, severity: str, psa_risk: str) -> dict:
    """Generate personalized recommendations."""
    recommendations = []
    
    # Severity-based
    if severity == "severe":
        recommendations.append("Schedule urgent dermatology consultation within 1-2 weeks")
        recommendations.append("Current symptoms suggest need for systemic or biologic therapy")
    elif severity == "moderate":
        recommendations.append("Schedule dermatology appointment within 2-4 weeks")
        recommendations.append("Consider combination topical therapy (corticosteroid + vitamin D analog)")
    else:
        recommendations.append("Continue current treatment with regular monitoring")
        recommendations.append("Maintain consistent moisturizing routine")
    
    # PSA risk
    if psa_risk == "high":
        recommendations.append("Consult rheumatologist urgently due to high psoriatic arthritis risk")
    elif psa_risk == "medium":
        recommendations.append("Monitor joint symptoms closely")
    
    # Triggers
    if data.screen2.worsenWithStress == "yes":
        recommendations.append("Implement stress management techniques (meditation, yoga)")
    
    if "alcohol" in data.screen2.triggers:
        recommendations.append("Avoid alcohol consumption as it may worsen symptoms")
    
    if data.screen2.sunlightEffect == "winter":
        recommendations.append("Consider phototherapy during winter months")
    
    if "minimal" in data.screen3.reliefSideEffects.lower():
        recommendations.append("Discuss alternative treatment options with dermatologist")
    
    recommendations.append("Keep a symptom diary to track triggers")
    recommendations.append("Maintain regular follow-up appointments")
    
    # Clinical notes
    notes = f"Assessment shows {severity} severity psoriasis with {psa_risk} psoriatic arthritis risk. "
    if psa_risk == "high":
        notes += "Joint and nail involvement requires prompt evaluation. "
    if severity in ["moderate", "severe"] and data.screen3.triedSystemic == "no":
        notes += "Patient may benefit from systemic therapy. "
    notes += "Early intervention recommended."
    
    # Urgency
    if severity == "severe" or psa_risk == "high":
        urgency = "high"
        followup_weeks = 1
    elif severity == "moderate":
        urgency = "medium"
        followup_weeks = 4
    else:
        urgency = "low"
        followup_weeks = 8
    
    return {
        "nextSteps": recommendations[:7],
        "additionalNotes": notes,
        "urgency": urgency,
        "followup_weeks": followup_weeks
    }
```

---

### Step 3: Add the Endpoint
Add this new endpoint to your existing FastAPI app:

```python
@app.post("/questionnaire/submit", response_model=QuestionnaireResponse)
async def submit_questionnaire(request: QuestionnaireRequest):
    """
    Receives questionnaire data and returns personalized recommendations.
    """
    try:
        assessment_id = str(uuid.uuid4())
        
        # Assess severity and risks
        severity = assess_severity(request)
        psa_risk = assess_psa_risk(request.screen3)
        
        # Generate recommendations
        ai_recommendations = generate_recommendations(request, severity, psa_risk)
        
        # Optional: Log for debugging
        print(f"\n{'='*50}")
        print(f"New Assessment: {assessment_id}")
        print(f"Patient: {request.screen1.gender}, Age {request.screen1.age}")
        print(f"Severity: {severity}, PSA Risk: {psa_risk}")
        print(f"{'='*50}\n")
        
        return QuestionnaireResponse(
            assessment_id=assessment_id,
            timestamp=request.timestamp,
            severity_assessment=severity,
            psoriatic_arthritis_risk=psa_risk,
            nextSteps=ai_recommendations["nextSteps"],
            additionalNotes=ai_recommendations["additionalNotes"],
            treatment_urgency=ai_recommendations["urgency"],
            recommended_followup_weeks=ai_recommendations["followup_weeks"]
        )
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
```

---

### Step 4: Ensure CORS is Configured
Make sure your existing backend has CORS enabled for React Native:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 3. Testing the New Endpoint

### Test with curl
```bash
curl -X POST http://192.168.31.117:8000/questionnaire/submit \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-07T10:30:00Z",
    "screen1": {
      "gender": "Female",
      "age": "28",
      "psoriasisHistory": "recurrent",
      "location": ["scalp", "elbows"],
      "appearance": ["red", "scaly"],
      "size": ["coin"],
      "nails": ["pitting"],
      "scalp": ["flaking"]
    },
    "screen2": {
      "onsetDate": "2 weeks ago",
      "symptomPattern": "intermittent",
      "lesionSpeed": "gradual",
      "itching": 7,
      "burning": 4,
      "pain": 3,
      "bleeding": 2,
      "worsenAtNight": "yes",
      "worsenWithStress": "yes",
      "triggers": ["stress"],
      "medTriggers": [],
      "sunlightEffect": "winter"
    },
    "screen3": {
      "dailyImpact": "moderate",
      "emotionalImpact": "sometimes",
      "relationshipsImpact": "some",
      "jointPain": "yes",
      "jointsAffected": ["fingers"],
      "nailWithJoint": "yes",
      "pastTreatments": "Topical steroids",
      "familyHistory": ["psoriasis"],
      "otherConditions": [],
      "currentTreatment": "Coal tar",
      "reliefSideEffects": "Minimal relief",
      "triedSystemic": "no",
      "feverInfection": "no",
      "weightLossFatigue": "no"
    }
  }'
```

Expected response:
```json
{
  "assessment_id": "uuid-here",
  "timestamp": "2025-12-07T10:30:00Z",
  "severity_assessment": "moderate",
  "psoriatic_arthritis_risk": "high",
  "nextSteps": [
    "Schedule dermatology appointment within 2-4 weeks",
    "Consider combination topical therapy",
    "Consult rheumatologist urgently due to high psoriatic arthritis risk",
    "Implement stress management techniques",
    "Consider phototherapy during winter months",
    "Discuss alternative treatment options",
    "Keep a symptom diary"
  ],
  "additionalNotes": "Assessment shows moderate severity psoriasis with high psoriatic arthritis risk...",
  "treatment_urgency": "high",
  "recommended_followup_weeks": 1
}
```

---

## 4. Integration with Frontend

Your frontend is already configured to call this endpoint! When a user completes the assessment:

1. ✅ Assessment data collected in Context
2. ✅ POST request sent to `/questionnaire/submit`
3. ✅ Response displayed in Results screen

**No frontend changes needed** - it's ready to work with your backend.

---

## 5. Optional: Add Database Storage for History

### Add SQLAlchemy Model (if using SQL database)
```python
from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Assessment(Base):
    __tablename__ = "assessments"
    
    assessment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, index=True)  # From JWT/Cognito
    created_at = Column(DateTime, default=datetime.utcnow)
    questionnaire_data = Column(JSON)
    severity = Column(String)
    psa_risk = Column(String)
    recommendations = Column(JSON)
```

### Save Assessment in Endpoint
```python
@app.post("/questionnaire/submit")
async def submit_questionnaire(request: QuestionnaireRequest, db: Session = Depends(get_db)):
    # ... existing code ...
    
    # Save to database
    assessment = Assessment(
        assessment_id=assessment_id,
        user_id=user_id,  # From JWT token
        questionnaire_data=request.dict(),
        severity=severity,
        psa_risk=psa_risk,
        recommendations=ai_recommendations
    )
    db.add(assessment)
    db.commit()
    
    return QuestionnaireResponse(...)
```

---

## 6. Optional: Add JWT Authentication

### Extract User from JWT Token
```python
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Extract user ID from JWT token."""
    token = credentials.credentials
    try:
        # Verify JWT (adjust based on your auth setup)
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        return user_id
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Use in endpoint
@app.post("/questionnaire/submit")
async def submit_questionnaire(
    request: QuestionnaireRequest,
    user_id: str = Depends(get_current_user)
):
    # Now you have authenticated user_id
    ...
```

---

## 7. Optional: Retrieve Assessment History

### Add History Endpoint
```python
@app.get("/assessments/history")
async def get_assessment_history(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's past assessments."""
    assessments = db.query(Assessment)\
        .filter(Assessment.user_id == user_id)\
        .order_by(Assessment.created_at.desc())\
        .limit(20)\
        .all()
    
    return [{
        "assessment_id": str(a.assessment_id),
        "created_at": a.created_at.isoformat(),
        "severity": a.severity,
        "psa_risk": a.psa_risk
    } for a in assessments]
```

---

## 8. Summary of Changes to Your Backend

**Required (minimum):**
- ✅ Add Pydantic models (Screen1, Screen2, Screen3, Request/Response)
- ✅ Add helper functions (assess_severity, assess_psa_risk, generate_recommendations)
- ✅ Add `/questionnaire/submit` endpoint
- ✅ Ensure CORS is enabled

**Optional (for full features):**
- 🔲 Add database table for assessment storage
- 🔲 Add JWT authentication extraction
- 🔲 Add `/assessments/history` endpoint for user history
- 🔲 Integrate OpenAI/Claude for AI-powered recommendations

---

## 9. Quick Checklist

- [ ] Copy models to your backend code
- [ ] Copy helper functions
- [ ] Add `/questionnaire/submit` endpoint
- [ ] Verify CORS is configured
- [ ] Test with curl command above
- [ ] Test with frontend app
- [ ] (Optional) Add database storage
- [ ] (Optional) Add JWT authentication
- [ ] (Optional) Add history retrieval

---

This gives you **just the questionnaire handling** to add to your existing backend!
