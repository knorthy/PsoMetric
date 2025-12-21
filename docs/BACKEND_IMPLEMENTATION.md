# PsoMetric Backend Implementation Guide

## Overview

The frontend sends a **single request** containing both the lesion image and questionnaire data. The backend must:

1. **Receive** the combined payload (image + questionnaire JSON)
2. **Analyze** the image using ML models (get severity scores, annotated image)
3. **Generate** personalized "Next Steps" using an LLM based on questionnaire + ML results
4. **Store** everything as a **single DynamoDB record**
5. **Return** the complete result to the frontend

---

## API Endpoint

### `POST /analyze/`

**Content-Type:** `multipart/form-data`

#### Request Fields

| Field | Type | Description |
|-------|------|-------------|
| `file` | `UploadFile` | The lesion image (JPEG/PNG) |
| `questionnaire_data` | `Form(str)` | JSON string containing questionnaire answers |

#### Questionnaire Data Structure (JSON)

```json
{
  // Demographics
  "gender": "Male" | "Female",
  "age": "25",
  "psoriasisHistory": "first" | "recurrent",
  
  // Symptoms - Location & Appearance
  "location": ["scalp", "elbows", "knees", "nails", "genitals", "palmsSoles"],
  "appearance": ["red", "scaly", "silvery", "cracked", "bleeding", "pustular"],
  "size": ["coin", "palm", "widespread"],
  
  // Severity Ratings (0-10)
  "itching": 7,
  "pain": 4,
  
  // Impact & Joints
  "jointPain": "yes" | "no",
  "jointsAffected": ["fingers", "toes", "back", "knees", "wrists"],
  "dailyImpact": "none" | "mild" | "moderate" | "severe",
  "currentTreatment": "topical steroid",
  
  // User Info (from Cognito)
  "userId": "abc123-def456",
  "username": "john_doe"
}
```

---

## Backend Processing Flow

### Step 1: Parse Request

```python
from fastapi import FastAPI, UploadFile, Form
import json

@app.post("/analyze/")
async def analyze(
    file: UploadFile,
    questionnaire_data: str = Form(...)
):
    # Parse questionnaire JSON
    questionnaire = json.loads(questionnaire_data)
    user_id = questionnaire.get("userId")
    
    # Read image bytes
    image_bytes = await file.read()
```

### Step 2: Run ML Model

Run your existing ML pipeline on the image:

```python
# Your ML model inference
ml_result = run_ml_analysis(image_bytes)

# Expected ML output:
# {
#     "global_score": 5.2,          # Overall severity (0-10 or 0-72)
#     "diagnosis": "Moderate",       # "Clear" | "Mild" | "Moderate" | "Severe"
#     "erythema": 2,                # Redness score (0-4)
#     "induration": 3,              # Thickness score (0-4)
#     "scaling": 2,                 # Desquamation score (0-4)
#     "lesions_found": 3,           # Number of detected lesions
#     "annotated_image_base64": "..." # Base64 encoded image with bounding boxes
# }
```

### Step 3: Generate LLM Next Steps

Use the questionnaire + ML results to generate personalized recommendations:

```python
import openai  # or your preferred LLM client

def generate_next_steps(questionnaire: dict, ml_result: dict) -> dict:
    prompt = f"""
    You are a dermatology assistant. Based on the following psoriasis assessment, 
    provide 4-6 personalized next steps for the patient.
    
    ## ML Analysis Results:
    - Severity Score: {ml_result['global_score']}/10
    - Diagnosis: {ml_result['diagnosis']}
    - Erythema (Redness): {ml_result['erythema']}/4
    - Induration (Thickness): {ml_result['induration']}/4
    - Scaling: {ml_result['scaling']}/4
    - Lesions Found: {ml_result['lesions_found']}
    
    ## Patient Questionnaire:
    - Age: {questionnaire.get('age', 'Not provided')}
    - Gender: {questionnaire.get('gender', 'Not provided')}
    - History: {questionnaire.get('psoriasisHistory', 'Not provided')}
    - Affected Areas: {', '.join(questionnaire.get('location', []))}
    - Appearance: {', '.join(questionnaire.get('appearance', []))}
    - Size: {', '.join(questionnaire.get('size', []))}
    - Itching Level: {questionnaire.get('itching', 0)}/10
    - Pain Level: {questionnaire.get('pain', 0)}/10
    - Joint Pain: {questionnaire.get('jointPain', 'no')}
    - Joints Affected: {', '.join(questionnaire.get('jointsAffected', []))}
    - Daily Impact: {questionnaire.get('dailyImpact', 'Not specified')}
    - Current Treatment: {questionnaire.get('currentTreatment', 'None')}
    
    Provide actionable, specific recommendations. If joint pain is present, 
    mention possible psoriatic arthritis. Be encouraging but medically appropriate.
    
    Return as JSON:
    {{
        "next_steps": ["step 1", "step 2", ...],
        "additional_notes": "Any important notes or warnings"
    }}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

### Step 4: Store in DynamoDB

Save **ONE complete record** with all data:

```python
import boto3
from datetime import datetime
import uuid

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('PsoMetricAssessments')

def store_assessment(user_id: str, questionnaire: dict, ml_result: dict, llm_result: dict):
    assessment_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    item = {
        # Primary keys
        "user_id": user_id,                    # Partition key
        "created_at": created_at,              # Sort key
        "assessment_id": assessment_id,
        
        # ML Analysis Results
        "global_score": ml_result["global_score"],
        "diagnosis": ml_result["diagnosis"],
        "erythema": ml_result["erythema"],
        "induration": ml_result["induration"],
        "scaling": ml_result["scaling"],
        "lesions_found": ml_result["lesions_found"],
        "annotated_image_base64": ml_result["annotated_image_base64"],
        
        # LLM-Generated Recommendations
        "next_steps": llm_result["next_steps"],
        "additional_notes": llm_result.get("additional_notes", ""),
        
        # Questionnaire Data (for history recall)
        "questionnaire": {
            "gender": questionnaire.get("gender"),
            "age": questionnaire.get("age"),
            "psoriasisHistory": questionnaire.get("psoriasisHistory"),
            "location": questionnaire.get("location", []),
            "appearance": questionnaire.get("appearance", []),
            "size": questionnaire.get("size", []),
            "itching": questionnaire.get("itching", 0),
            "pain": questionnaire.get("pain", 0),
            "jointPain": questionnaire.get("jointPain"),
            "jointsAffected": questionnaire.get("jointsAffected", []),
            "dailyImpact": questionnaire.get("dailyImpact"),
            "currentTreatment": questionnaire.get("currentTreatment"),
        }
    }
    
    table.put_item(Item=item)
    return assessment_id, created_at
```

### Step 5: Return Complete Response

```python
@app.post("/analyze/")
async def analyze(file: UploadFile, questionnaire_data: str = Form(...)):
    # 1. Parse
    questionnaire = json.loads(questionnaire_data)
    user_id = questionnaire.get("userId")
    image_bytes = await file.read()
    
    # 2. ML Analysis
    ml_result = run_ml_analysis(image_bytes)
    
    # 3. LLM Next Steps
    llm_result = generate_next_steps(questionnaire, ml_result)
    
    # 4. Store in DynamoDB
    assessment_id, created_at = store_assessment(user_id, questionnaire, ml_result, llm_result)
    
    # 5. Return complete response
    return {
        "assessment_id": assessment_id,
        "created_at": created_at,
        
        # ML Results
        "global_score": ml_result["global_score"],
        "diagnosis": ml_result["diagnosis"],
        "erythema": ml_result["erythema"],
        "induration": ml_result["induration"],
        "scaling": ml_result["scaling"],
        "lesions_found": ml_result["lesions_found"],
        "annotated_image_base64": ml_result["annotated_image_base64"],
        
        # LLM Results
        "next_steps": llm_result["next_steps"],
        "additional_notes": llm_result.get("additional_notes", ""),
    }
```

---

## Response Structure

The frontend expects this exact structure:

```json
{
  "assessment_id": "uuid-string",
  "created_at": "2024-12-17T10:30:00.000Z",
  
  "global_score": 5.2,
  "diagnosis": "Moderate",
  "erythema": 2,
  "induration": 3,
  "scaling": 2,
  "lesions_found": 3,
  "annotated_image_base64": "base64-encoded-image-string",
  
  "next_steps": [
    "Continue using your current topical steroid as prescribed",
    "Apply moisturizer twice daily, especially after bathing",
    "Consider asking your dermatologist about phototherapy options",
    "Given the joint pain reported, discuss psoriatic arthritis screening with your doctor",
    "Track flare-ups and potential triggers in a symptom diary"
  ],
  "additional_notes": "Your moderate severity suggests good control may be achievable with consistent treatment. The presence of joint symptoms warrants professional evaluation."
}
```

---

## History Endpoint

### `GET /analyze/history/{user_id}`

Returns all assessments for a user, sorted by date (newest first):

```python
@app.get("/analyze/history/{user_id}")
async def get_history(user_id: str):    
    response = table.query(
        KeyConditionExpression=Key('user_id').eq(user_id),
        ScanIndexForward=False  # Newest first
    )
    
    return {"assessments": response.get('Items', [])}
```

### `GET /analyze/result/{user_id}/{created_at}`

Returns a single assessment by its keys:

```python
@app.get("/analyze/result/{user_id}/{created_at}")
async def get_result(user_id: str, created_at: str):
    response = table.get_item(
        Key={
            'user_id': user_id,
            'created_at': created_at
        }
    )
    
    return response.get('Item', {})
```

---

## DynamoDB Table Schema

**Table Name:** `PsoMetricAssessments`

| Attribute | Type | Key |
|-----------|------|-----|
| `user_id` | String | Partition Key |
| `created_at` | String (ISO) | Sort Key |
| `assessment_id` | String | - |
| `global_score` | Number | - |
| `diagnosis` | String | - |
| `erythema` | Number | - |
| `induration` | Number | - |
| `scaling` | Number | - |
| `lesions_found` | Number | - |
| `annotated_image_base64` | String | - |
| `next_steps` | List | - |
| `additional_notes` | String | - |
| `questionnaire` | Map | - |

---

## Frontend Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  assess.jsx (Questionnaire)                                     │
│       ↓                                                         │
│  photoguide.jsx                                                 │
│       ↓                                                         │
│  camera-welcome.jsx                                             │
│    • Collects questionnaire from AssessmentContext              │
│    • User takes/uploads photo                                   │
│    • Sends SINGLE FormData request:                             │
│        - file: UploadFile                                       │
│        - questionnaire_data: JSON string                        │
│       ↓                                                         │
│  Receives complete response                                     │
│    • Stores in tempData (analysis_${id}, questionnaire_${id})   │
│    • Navigates to result.jsx                                    │
│       ↓                                                         │
│  result.jsx                                                     │
│    • Displays ML scores, annotated image                        │
│    • Displays questionnaire summary                             │
│    • Displays LLM-generated "Next Steps"                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  POST /analyze/                                                 │
│    1. Parse questionnaire_data JSON                             │
│    2. Run ML model on image → scores + annotated image          │
│    3. Send questionnaire + ML results to LLM → next_steps       │
│    4. Store SINGLE record in DynamoDB                           │
│    5. Return complete response                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notes

- **Single Record**: Each assessment creates ONE DynamoDB item containing everything
- **No Separate Endpoints**: No `/questionnaire/submit` - everything in `/analyze/`
- **LLM Integration**: Use OpenAI GPT-4 or similar for generating next steps
- **Image Storage**: Annotated image stored as base64 in the record (or use S3 + URL)
- **History**: Query by `user_id` to get all assessments for history tab
