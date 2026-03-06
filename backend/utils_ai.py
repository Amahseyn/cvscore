import os
import re
import json
import logging
import time
from typing import Dict, Any, Optional, List
from openai import OpenAI

logger = logging.getLogger("cvscore.ai")

def safe_json_parse(text: str) -> Dict[str, Any]:
    """
    Robustly parse JSON from AI response, handling markdown blocks, 
    prefix/suffix text, and control characters.
    """
    if not text:
        return {}
    
    # 1. Try to find the first balanced JSON object
    first_idx = text.find('{')
    if first_idx != -1:
        stack = 0
        for i in range(first_idx, len(text)):
            if text[i] == '{':
                stack += 1
            elif text[i] == '}':
                stack -= 1
                if stack == 0:
                    text = text[first_idx:i+1]
                    break
    
    # 2. Strip standard markdown code blocks (if they were inside or outside)
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning(f"Initial JSON parse failed: {e}. Attempting cleanup...")
        
        # 3. Cleanup: remove control characters
        cleaned = re.sub(r'[\x00-\x1F\x7F]', ' ', text)
        
        # 4. Handle common LLM bad escapes: \x is not valid in JSON, replace with \u00
        cleaned = re.sub(r'\\x([0-9a-fA-F]{2})', r'\\u00\1', cleaned)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as final_e:
            logger.error(f"Critical JSON Parsing Failure: {final_e}")
            logger.error(f"EXTRACTED CONTENT: {text}")
            raise final_e

class PromptLibrary:
    """Externalized storage for complex AI prompts."""
    
    STRUCTURED_EXTRACT = """
    You are a professional recruiting coordinator. Extract structured data from the provided CV text.
    Return ONLY a valid JSON object. Do not include any text outside the JSON block.
    Ensure all fields are present, using null or [] if information is missing.
    
    JSON Schema:
    {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "linkedin": "string (URL if found)",
        "location": "string",
        "seniority_level": "string (Junior, Mid, Senior, or Lead/Principal)",
        "years_of_experience": int (estimated numeric value),
        "skills": ["list", "of", "skills"],
        "keywords": ["list", "of", "industry-standard", "keywords"],
        "additional_notes": "string (any extra observations)",
        "experience": [{"title": "str", "company": "str", "duration": "str", "summary": "str"}],
        "education": [{"degree": "str", "institution": "str", "year": "str"}]
    }
    """

    CORE_SCORING = """
    You are a senior technical recruiter and career coach. Evaluate the provided CV text.
    {context_jd}
    
    Return ONLY a valid JSON object. Do not include any text outside the JSON block.
    Ensure all fields are present, using null or [] if information is missing.
    
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
    - keyword_score: How well the candidate's keywords align with industry standards and the provided Job Description.
    
    If a JD is provided:
    - Include a 'match_percentage' (0-100).
    - Identify 'skill_gaps' (missing critical requirements).
    - Generate a 'cover_letter': A professional, concise, and persuasive cover letter tailored specifically to the provided Job Description.
    
    Determine the candidate's seniority level (Junior, Mid, Senior, Lead/Principal) and estimate total years of experience.

    JSON Schema:
    {{
        "total_score": int (0-100),
        "match_percentage": int (0-100) or null,
        "ats_compatibility_score": int (0-100),
        "seniority_level": "string",
        "years_of_experience": int,
        "additional_notes": "string",
        "performance_metrics": {{
            "impact_score": int (0-100),
            "technical_depth_score": int (0-100),
            "soft_skills_score": int (0-100),
            "growth_potential_score": int (0-100),
            "stability_score": int (0-100),
            "readability_score": int (0-100),
            "keyword_score": int (0-100)
        }},
        "breakdown": {{
            "professionalism": int (0-25),
            "skills": int (0-25),
            "experience": int (0-25),
            "education": int (0-25)
        }},
        "pros": ["list of 3 strings"],
        "cons": ["list of 3 strings"],
        "skill_gaps": ["list of strings"] or [],
        "overall_feedback": "string",
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
            "career_growth": "string",
            "job_suggestions": ["list of strings"],
            "keywords_skills": ["list of strings"],
            "job_targets": ["list of strings"],
            "cover_letter": "string" or null
        }}
    }}
    """

    INTERNAL_RANKING = """
    You are a career matcher. Given a candidate's CV data and a list of internal Job Descriptions (Projects), rank the projects by relevance.
    For each project, provide a match score (0-100) and a brief 1-sentence reasoning.
    
    Candidate Data:
    {candidate_data}
    
    Internal Projects:
    {projects_data}
    
    Return JSON:
    {{
        "suggestions": [
            {{"project_id": int, "project_name": "string", "match_score": int, "reasoning": "string"}}
        ]
    }}
    """

    INTERVIEW_GEN = """
    You are an expert technical interviewer. Generate a tailored interview script.
    Return ONLY a valid JSON object.
    {context_jd}
    
    Candidate Dossier Summary:
    {dossier_summary}

    Return JSON:
    {{
        "intro": "string",
        "questions": [
            {{"category": "Technical", "question": "string", "expected_signal": "string"}},
            {{"category": "Behavioral", "question": "string", "expected_signal": "string"}}
        ],
        "closing": "string"
    }}
    """

def rank_projects(candidate_data: str, projects: List[Dict[str, Any]], api_key: Optional[str] = None) -> Dict[str, Any]:
    logger.info(f"Starting Project Ranking for {len(projects)} positions...")
    start_time = time.time()
    client = get_ai_client(api_key)
    
    projects_data = "\n".join([f"ID: {p['id']} | Name: {p['name']} | JD: {p['jd'][:500]}..." for p in projects])
    
    system_prompt = PromptLibrary.INTERNAL_RANKING.format(
        candidate_data=candidate_data,
        projects_data=projects_data
    )
    
    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Rank these internal positions."}
        ],
        max_tokens=2000,
        timeout=60
    )
    duration = time.time() - start_time
    logger.info(f"Project Ranking completed in {duration:.2f}s")
    return {
        "data": safe_json_parse(response.choices[0].message.content),
        "model": response.model or "openrouter/auto"
    }

def get_ai_client(api_key: Optional[str] = None) -> OpenAI:
    final_key = api_key or os.getenv("OPENROUTER_API_KEY")
    if not final_key:
        raise ValueError("AI API Key missing. Set OPENROUTER_API_KEY or provide in request.")
    return OpenAI(base_url="https://openrouter.ai/api/v1", api_key=final_key)

def extract_structured_data(cv_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    logger.info("Starting AI Structured Extraction...")
    start_time = time.time()
    client = get_ai_client(api_key)
    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PromptLibrary.STRUCTURED_EXTRACT},
            {"role": "user", "content": cv_text}
        ],
        max_tokens=2000,
        timeout=60
    )
    duration = time.time() - start_time
    logger.info(f"AI Extraction completed in {duration:.2f}s")
    return {
        "data": safe_json_parse(response.choices[0].message.content),
        "model": response.model or "openrouter/auto"
    }

def score_cv(cv_text: str, job_description: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    logger.info(f"Starting AI CV Scoring (JD provided: {bool(job_description)})...")
    start_time = time.time()
    client = get_ai_client(api_key)
    context_jd = f"Analyze relative to this Job Description: {job_description}" if job_description else "Analyze as a general professional CV."
    
    system_prompt = PromptLibrary.CORE_SCORING.format(context_jd=context_jd)

    response = client.chat.completions.create(
        model="openrouter/auto",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": cv_text}
        ],
        max_tokens=3000,
        timeout=120
    )
    duration = time.time() - start_time
    logger.info(f"AI Scoring completed in {duration:.2f}s")
    return {
        "data": safe_json_parse(response.choices[0].message.content),
        "model": response.model or "openrouter/auto"
    }

def generate_interview(cv_text: str, dossier_summary: str, job_description: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    logger.info("Starting AI Interview Generation...")
    start_time = time.time()
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
        ],
        max_tokens=2500,
        timeout=90
    )
    duration = time.time() - start_time
    logger.info(f"AI Interview Generation completed in {duration:.2f}s")
    return {
        "data": safe_json_parse(response.choices[0].message.content),
        "model": response.model or "openrouter/auto"
    }
