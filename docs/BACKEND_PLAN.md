# PsoMetric Backend Implementation Plan

## Overview
Backend system to receive questionnaire data from the PsoMetric app, process it with GenAI (GPT/Claude/etc.), and return personalized "Next Steps" recommendations for psoriasis patients.

---

## Architecture

### Current Setup
- **Image Analysis Endpoint**: `http://192.168.31.117:8000/analyze/` (FastAPI - WORKING)
- **Authentication**: AWS Cognito (configured but not integrated with assessments)
- **Backend Framework**: FastAPI (Python)

### New Requirements
- **Questionnaire Endpoint**: `POST /questionnaire/submit`
- **GenAI Integration**: OpenAI GPT-4, Anthropic Claude, or AWS Bedrock
- **Data Storage**: PostgreSQL/MongoDB for assessment history
- **User Association**: Link assessments to Cognito user IDs

---

## 1. Questionnaire Submission Endpoint

### Endpoint Specification

```http
POST http://192.168.31.117:8000/questionnaire/submit
Content-Type: application/json
Authorization: Bearer <cognito-jwt-token> (optional for now)

Request Body:
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

Response (200 OK):
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T10:30:00.000Z",
  "severity_assessment": "moderate",
  "psoriatic_arthritis_risk": "high",
  "nextSteps": [
    "Schedule appointment with dermatologist for comprehensive evaluation",
    "Consider switching to combination therapy (topical corticosteroid + vitamin D analog)",
    "Consult rheumatologist due to joint pain with nail involvement - possible psoriatic arthritis",
    "Implement stress management techniques (meditation, yoga) as stress is a major trigger",
    "Avoid alcohol consumption which may worsen symptoms and reduce treatment effectiveness",
    "Document symptom patterns in a daily journal to identify additional triggers",
    "Consider phototherapy if topical treatments remain ineffective after 8-12 weeks"
  ],
  "additionalNotes": "Based on your symptoms, particularly the combination of nail changes and joint pain, there's a significant risk of psoriatic arthritis. Early intervention is crucial. Your current treatment (coal tar shampoo) may be insufficient for your symptom severity. A dermatologist can prescribe stronger medications or recommend systemic treatments.",
  "treatment_urgency": "medium",
  "recommended_followup_weeks": 4
}
```

---

## 2. FastAPI Backend Implementation

### File Structure
```
backend/
├── main.py                 # FastAPI app entry point
├── routers/
│   ├── image_analysis.py   # Existing /analyze endpoint
│   └── questionnaire.py    # NEW /questionnaire/submit endpoint
├── services/
│   ├── genai_service.py    # GenAI integration (OpenAI/Claude/Bedrock)
│   └── assessment_logic.py # Business logic for risk assessment
├── models/
│   ├── questionnaire.py    # Pydantic models for request/response
│   └── database.py         # SQLAlchemy models
├── database/
│   ├── connection.py       # Database connection
│   └── crud.py             # CRUD operations
└── requirements.txt        # Python dependencies
```

### Code Implementation

#### `routers/questionnaire.py`
```python
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from models.questionnaire import QuestionnaireRequest, QuestionnaireResponse
from services.genai_service import generate_recommendations
from services.assessment_logic import assess_severity, assess_psa_risk
from database.crud import save_assessment
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/questionnaire/submit", response_model=QuestionnaireResponse)
async def submit_questionnaire(request: QuestionnaireRequest, user_id: Optional[str] = None):
    """
    Receives questionnaire data, processes with GenAI, and returns personalized recommendations.
    """
    try:
        # 1. Generate unique assessment ID
        assessment_id = str(uuid.uuid4())
        
        # 2. Assess severity and risks
        severity = assess_severity(request)
        psa_risk = assess_psa_risk(request.screen3)
        
        # 3. Generate AI recommendations
        ai_recommendations = await generate_recommendations(
            questionnaire_data=request.dict(),
            severity=severity,
            psa_risk=psa_risk
        )
        
        # 4. Save to database (optional - for history tracking)
        if user_id:
            await save_assessment(
                user_id=user_id,
                assessment_id=assessment_id,
                questionnaire=request.dict(),
                ai_response=ai_recommendations,
                timestamp=datetime.utcnow()
            )
        
        # 5. Return response
        return QuestionnaireResponse(
            assessment_id=assessment_id,
            timestamp=request.timestamp,
            severity_assessment=severity,
            psoriatic_arthritis_risk=psa_risk,
            nextSteps=ai_recommendations["next_steps"],
            additionalNotes=ai_recommendations["notes"],
            treatment_urgency=ai_recommendations["urgency"],
            recommended_followup_weeks=ai_recommendations["followup_weeks"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
```

#### `services/genai_service.py`
```python
import openai
import os
import json

# Configure OpenAI (or use Anthropic/Bedrock instead)
openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_recommendations(questionnaire_data: dict, severity: str, psa_risk: str) -> dict:
    """
    Uses GPT-4 to generate personalized psoriasis treatment recommendations.
    """
    
    # Construct detailed prompt
    prompt = f"""
You are a clinical decision support AI specialized in dermatology, specifically psoriasis management. 
Based on the following patient questionnaire data, provide evidence-based, personalized "next steps" recommendations.

**Patient Data:**
{json.dumps(questionnaire_data, indent=2)}

**Automated Assessments:**
- Severity: {severity}
- Psoriatic Arthritis Risk: {psa_risk}

**Instructions:**
1. Generate 5-7 specific, actionable "next steps" recommendations prioritized by clinical importance
2. Consider:
   - Symptom severity and distribution
   - Treatment history and current regimen effectiveness
   - Risk factors (family history, comorbidities, triggers)
   - Psoriatic arthritis warning signs
   - Quality of life impact
   - Red flags requiring urgent care
3. Provide additional clinical notes explaining key concerns
4. Assess treatment urgency (low/medium/high/urgent)
5. Recommend follow-up timeline in weeks

**Output Format (JSON):**
{{
  "next_steps": [
    "First recommendation with specific action",
    "Second recommendation...",
    ...
  ],
  "notes": "Detailed clinical reasoning and key concerns",
  "urgency": "medium",
  "followup_weeks": 4
}}

Be empathetic but medically accurate. Include when to seek immediate care if applicable.
"""

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-turbo",  # or "gpt-4o", "claude-3-opus", etc.
            messages=[
                {"role": "system", "content": "You are a clinical decision support AI for dermatology."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent medical advice
            max_tokens=1500
        )
        
        content = response.choices[0].message.content
        
        # Parse JSON response
        # Some models wrap in ```json blocks, clean that up
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        ai_output = json.loads(content)
        return ai_output
        
    except Exception as e:
        # Fallback to rule-based recommendations if AI fails
        print(f"GenAI Error: {str(e)}")
        return get_fallback_recommendations(questionnaire_data, severity, psa_risk)


def get_fallback_recommendations(data: dict, severity: str, psa_risk: str) -> dict:
    """
    Rule-based fallback recommendations if GenAI fails.
    """
    steps = []
    
    # Basic recommendations based on severity
    if severity == "mild":
        steps.append("Continue daily moisturization with emollients")
        steps.append("Use topical corticosteroids as prescribed")
    elif severity == "moderate":
        steps.append("Schedule dermatology appointment within 2-4 weeks")
        steps.append("Consider combination topical therapy")
    else:  # severe
        steps.append("Urgent dermatology consultation needed")
        steps.append("May require systemic or biologic therapy")
    
    # PSA risk
    if psa_risk == "high":
        steps.append("Consult rheumatologist for psoriatic arthritis evaluation")
    
    # Trigger management
    if data.get("screen2", {}).get("worsenWithStress") == "yes":
        steps.append("Implement stress management techniques")
    
    return {
        "next_steps": steps,
        "notes": "These are general recommendations. Please consult healthcare provider.",
        "urgency": "medium",
        "followup_weeks": 4
    }
```

#### `services/assessment_logic.py`
```python
def assess_severity(questionnaire: dict) -> str:
    """
    Assess psoriasis severity based on questionnaire data.
    Uses BSA (Body Surface Area) approximation and symptom intensity.
    """
    screen1 = questionnaire.get("screen1", {})
    screen2 = questionnaire.get("screen2", {})
    
    # Count affected body areas
    locations = screen1.get("location", [])
    size = screen1.get("size", [])
    
    # Calculate intensity scores
    itching = screen2.get("itching", 0)
    burning = screen2.get("burning", 0)
    pain = screen2.get("pain", 0)
    
    avg_intensity = (itching + burning + pain) / 3
    
    # Severity assessment logic
    if "widespread" in size or len(locations) >= 5:
        return "severe"
    elif len(locations) >= 3 or "palm" in size:
        if avg_intensity >= 6:
            return "severe"
        return "moderate"
    else:
        if avg_intensity >= 7:
            return "moderate"
        return "mild"


def assess_psa_risk(screen3: dict) -> str:
    """
    Assess Psoriatic Arthritis risk based on clinical indicators.
    """
    joint_pain = screen3.get("jointPain") == "yes"
    nail_changes = len(screen3.get("nails", [])) > 0
    nail_with_joint = screen3.get("nailWithJoint") == "yes"
    
    if joint_pain and nail_with_joint:
        return "high"
    elif joint_pain or (nail_changes and len(screen3.get("nails", [])) >= 2):
        return "medium"
    else:
        return "low"
```

#### `models/questionnaire.py`
```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

## 3. GenAI Provider Options

### Option A: OpenAI GPT-4
**Pros:**
- Best reasoning capabilities
- Excellent medical knowledge
- Easy to integrate
- Consistent JSON output

**Cons:**
- Higher cost ($0.03/1K tokens)
- Data privacy concerns (data sent to OpenAI)
- Requires API key management

**Setup:**
```bash
pip install openai
export OPENAI_API_KEY="sk-..."
```

### Option B: Anthropic Claude
**Pros:**
- Excellent safety and accuracy
- Good medical reasoning
- More privacy-focused
- Lower cost than GPT-4

**Cons:**
- Slightly less consistent JSON formatting
- Requires separate API integration

**Setup:**
```bash
pip install anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Option C: AWS Bedrock (Claude/Llama)
**Pros:**
- Data stays in AWS infrastructure
- HIPAA compliant
- Lower latency (same region as Cognito)
- No separate API key needed (uses IAM)

**Cons:**
- More complex setup
- Requires AWS configuration
- Limited model selection

**Setup:**
```bash
pip install boto3
# Use AWS IAM role/credentials
```

### Recommendation
Start with **OpenAI GPT-4** for fastest development, then migrate to **AWS Bedrock** for production (HIPAA compliance).

---

## 4. Database Schema (Optional - for History)

### PostgreSQL Schema
```sql
CREATE TABLE assessments (
    assessment_id UUID PRIMARY KEY,
    user_id VARCHAR(255),  -- Cognito user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    questionnaire_data JSONB,
    ai_response JSONB,
    severity VARCHAR(50),
    psa_risk VARCHAR(50),
    image_pasi_score DECIMAL(4,2),
    image_uri TEXT
);

CREATE INDEX idx_user_assessments ON assessments(user_id, created_at DESC);
```

### Why Store Assessments?
- Enable assessment history in the app
- Track symptom progression over time
- Provide analytics to dermatologists
- Research and model improvement

---

## 5. Security & Compliance

### Authentication Integration
```python
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import requests

security = HTTPBearer()

async def verify_cognito_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify JWT token from AWS Cognito
    """
    token = credentials.credentials
    
    # Get Cognito public keys
    region = "ap-southeast-2"
    user_pool_id = "ap-southeast-2_CLLyW9heK"
    keys_url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
    
    try:
        # Verify JWT signature
        jwks = requests.get(keys_url).json()
        # ... JWT verification logic ...
        decoded = jwt.decode(token, options={"verify_signature": False})  # Simplified
        return decoded["sub"]  # Returns user ID
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Use in endpoint
@router.post("/questionnaire/submit")
async def submit_questionnaire(
    request: QuestionnaireRequest,
    user_id: str = Depends(verify_cognito_token)
):
    # user_id is now verified Cognito user
    ...
```

### HIPAA Compliance Considerations
1. **Data Encryption**: Use HTTPS/TLS for all communications
2. **Data Storage**: Encrypt database at rest
3. **Access Logs**: Log all data access for audit trails
4. **Data Retention**: Implement data retention policies
5. **BAA Required**: Business Associate Agreement with cloud providers
6. **Minimal PHI**: Avoid storing unnecessary personal health information

---

## 6. Deployment

### Development (Current)
```bash
# Run FastAPI locally
uvicorn main:app --host 192.168.31.117 --port 8000 --reload
```

### Production Options

#### Option A: AWS EC2
```bash
# Deploy to EC2 instance
# Use Nginx + Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

#### Option B: AWS Lambda + API Gateway (Serverless)
- Use AWS SAM or Serverless Framework
- Auto-scales, pay-per-request
- Better for variable load

#### Option C: AWS ECS/Fargate (Containerized)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7. Environment Variables

Create `.env` file:
```env
# GenAI
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
AWS_REGION=ap-southeast-2

# Database
DATABASE_URL=postgresql://user:pass@host:5432/psometric

# Cognito
COGNITO_REGION=ap-southeast-2
COGNITO_USER_POOL_ID=ap-southeast-2_CLLyW9heK
COGNITO_CLIENT_ID=...

# App
ENVIRONMENT=production
DEBUG=False
```

---

## 8. Testing

### Test Endpoint Locally
```bash
curl -X POST http://192.168.31.117:8000/questionnaire/submit \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-07T10:30:00Z",
    "screen1": {...},
    "screen2": {...},
    "screen3": {...}
  }'
```

### Frontend Testing (Before Backend Ready)
Modify `camera-welcome.jsx` to use mock response:
```javascript
// Temporary mock for testing
const MOCK_QUESTIONNAIRE_RESPONSE = {
  nextSteps: [
    "Schedule appointment with dermatologist",
    "Continue current moisturizing routine",
    "Avoid stress triggers identified in assessment"
  ],
  additionalNotes: "Your symptoms suggest moderate psoriasis. Early intervention recommended."
};

// In pickImageAndUpload function:
questionnaireResponse = MOCK_QUESTIONNAIRE_RESPONSE; // Use mock instead of API call
```

---

## 9. Cost Estimates

### GenAI API Costs (Monthly - 1000 assessments/month)
- **OpenAI GPT-4**: ~$30-60 (depends on prompt length)
- **Claude 3 Sonnet**: ~$15-30
- **AWS Bedrock Claude**: ~$20-40

### Infrastructure Costs
- **EC2 t3.small**: ~$15/month
- **RDS PostgreSQL**: ~$25/month (if storing history)
- **Total**: ~$40-100/month for 1000 users

---

## 10. Implementation Timeline

### Phase 1 (Week 1) - MVP
- [ ] Set up FastAPI questionnaire endpoint
- [ ] Integrate OpenAI GPT-4
- [ ] Basic severity assessment logic
- [ ] Return mock recommendations

### Phase 2 (Week 2) - Production Ready
- [ ] Add Cognito authentication
- [ ] Implement database storage
- [ ] Add error handling & logging
- [ ] Deploy to AWS EC2/Lambda

### Phase 3 (Week 3) - Enhancement
- [ ] Migrate to AWS Bedrock (HIPAA)
- [ ] Add assessment history retrieval
- [ ] Implement analytics dashboard
- [ ] Add rate limiting & monitoring

---

## 11. Next Steps

1. **Choose GenAI Provider**: OpenAI (fast start) vs AWS Bedrock (production)
2. **Set Up Backend Environment**: Install Python dependencies
3. **Implement Endpoint**: Copy code from this plan
4. **Test with Frontend**: Use mock data first, then real API
5. **Deploy**: Start with local/development server
6. **Iterate**: Improve prompt based on real usage

---

## Questions to Answer

1. **Do you want to store assessment history?** (Requires database)
2. **Should users be authenticated?** (Cognito integration)
3. **Which GenAI provider?** (OpenAI vs AWS Bedrock vs Claude)
4. **Where to deploy backend?** (AWS Lambda vs EC2 vs keep local)
5. **Budget constraints?** (API calls cost money)

Let me know your preferences and I can provide more specific implementation details!
