import os
import json
from openai import OpenAI
from typing import Optional, Dict, Any

class PromptLibrary:
    """Externalized storage for complex AI prompts."""
    
    STRUCTURED_EXTRACT = """
    You are a professional recruiting coordinator. Extract structured data from the provided CV text.
    Return ONLY a JSON object with:
    {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "skills": ["list", "of", "skills"],
        "experience": [{"title": "str", "company": "str", "duration": "str", "summary": "str"}],
        "education": [{"degree": "str", "institution": "str", "year": "str"}]
    }
    """

    CORE_SCORING = """
    You are a senior technical recruiter. Evaluate the provided CV text.
    {context_jd}
    
    Evaluate based on:
    1. Professionalism & Formatting (0-25)
    2. Skill Relevance/Depth (0-25)
    3. Experience Impact/Quality (0-25)
    4. Education/Certifications (0-25)

    In addition, provide deep Performance Metrics (0-100):
    - impact_score: Measurable achievements and action verbs.
    - technical_depth_score: Proficiency in complex systems and frameworks.
    - soft_skills_score: Communication, leadership, and collaboration indicators.
    - growth_potential_score: Fast learning, certifications, and upward trajectory.
    - stability_score: Tenure consistency and commitment signals.
    - readability_score: Flow, formatting, and clarity for human readers.
    
    If a JD is provided:
    - Include a 'match_percentage' (0-100).
    - Identify 'skill_gaps' (missing critical requirements).
    
    Return TWO distinct analysis sections:
    
    1. RECRUITER ANALYSIS:
    - executive_summary: High-level overview for a hiring manager.
    - technical_fit: How well they fit the specific tech stack.
    - hiring_risks: Any red flags.
    - verdict: A one-liner recommendation.

    2. CANDIDATE ANALYSIS:
    - resume_tips: Actionable advice to improve the CV.
    - market_positioning: Roles/levels to target.
    - interview_prep: Specific topics to refresh on.
    - career_growth: Potential next steps.

    Return ONLY a JSON object:
    {{
        "total_score": int (0-100),
        "match_percentage": int (0-100) or null,
        "performance_metrics": {{
            "impact_score": int (0-100),
            "technical_depth_score": int (0-100),
            "soft_skills_score": int (0-100),
            "growth_potential_score": int (0-100),
            "stability_score": int (0-100),
            "readability_score": int (0-100)
        }},
        "breakdown": {{
            "professionalism": int (0-25),
            "skills": int (0-25),
            "experience": int (0-25),
            "education": int (0-25)
        }},
        "pros": ["list of 3 key strengths"],
        "cons": ["list of 3 areas for improvement"],
        "skill_gaps": ["list of missing skills if JD provided"] or [],
        "overall_feedback": "Short professional feedback",
        "recruiter_analysis": {{
            "executive_summary": "string",
            "technical_fit": "string",
            "hiring_risks": ["list of strings"],
            "verdict": "string"
        }},
        "candidate_analysis": {{
            "resume_tips": ["list of strings"],
            "market_positioning": "string",
            "interview_prep": "string",
            "career_growth": "string"
        }}
    }}
    """

    INTERVIEW_GEN = """
    You are an expert technical interviewer. Generate a tailored interview script for the candidate.
    {context_jd}
    
    Candidate Dossier Summary:
    {dossier_summary}

    Generate 10 questions divided into:
    1. Technical Deep-Dive (focus on their specific tech stack and project experience)
    2. Behavioral/Soft Skills (focus on collaboration and leadership indicators)
    3. Culture & Growth (focus on their trajectory and learning potential)

    Return ONLY a JSON object:
    {
        "intro": "string (small talk/setup)",
        "questions": [
            {"category": "Technical", "question": "string", "expected_signal": "what to look for in the answer"},
            {"category": "Behavioral", "question": "string", "expected_signal": "string"}
        ],
        "closing": "string"
    }
    """

def get_ai_client(api_key: Optional[str] = None) -> OpenAI:
    final_key = api_key or os.getenv("OPENROUTER_API_KEY")
    if not final_key:
        raise ValueError("AI API Key missing. Set OPENROUTER_API_KEY or provide in request.")
    return OpenAI(base_url="https://openrouter.ai/api/v1", api_key=final_key)

def extract_structured_data(cv_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    client = get_ai_client(api_key)
    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PromptLibrary.STRUCTURED_EXTRACT},
            {"role": "user", "content": cv_text}
        ]
    )
    return json.loads(response.choices[0].message.content)

def score_cv(cv_text: str, job_description: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    client = get_ai_client(api_key)
    context_jd = f"Analyze relative to this Job Description: {job_description}" if job_description else "Analyze as a general professional CV."
    
    system_prompt = PromptLibrary.CORE_SCORING.format(context_jd=context_jd)

    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": cv_text}
        ]
    )
    return json.loads(response.choices[0].message.content)

def generate_interview(cv_text: str, dossier_summary: str, job_description: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    client = get_ai_client(api_key)
    context_jd = f"Relative to this Job Description: {job_description}" if job_description else "General professional interview."
    
    system_prompt = PromptLibrary.INTERVIEW_GEN.format(
        context_jd=context_jd,
        dossier_summary=dossier_summary
    )

    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Candidate CV Text: {cv_text}"}
        ]
    )
    return json.loads(response.choices[0].message.content)
