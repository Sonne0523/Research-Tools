"""
AI Service for Researcher Toolset.
All tasks are routed through the unified Agent Router.
"""
import os
from .agent_router import get_agent_router

# Agent-router powered functions
async def summarize_text(text: str):
    """Summarize research text using the unified agent."""
    router = get_agent_router()
    prompt = """
    # Role
    You are an elite Multi-Disciplinary Research Scientist and PhD Mentor. Your goal is to deconstruct the provided research paper into its core intellectual components. You do not summarize; you critically audit the methodology, theory, and data to find "scholarly leverage points" for a new researcher.

    # Task Instructions
    Perform a structural audit of the attached paper using the following format:

    ## 0. Bibliographic Metadata
    * **Title:** [Full Title]
    * **Authors & Affiliations:** [Primary Authors and Institutional Background]
    * **Publication Context:** [Journal Name, Volume, and Year]

    ## 1. Structural Deconstruction (The Audit)
    * **The Problem Statement:** Identify the specific real-world or theoretical void this paper attempts to fill.
    * **Methodological Rigor:** Identify the exact research design (e.g., Case Study, Experimental, Ethnographic). Audit the sampling strategy and data collection tools.
    * **Theoretical Lens:** What underlying theory or "school of thought" is used to interpret the data?
    * **Evidence Chain:** How do the authors move from raw data to their final conclusion? Is the logic sound or are there "leaps of faith"?

    ## 2. Innovation & Change Analysis
    * **Evolutionary Markers:** Identify where the paper shows a shift from tradition to modernity (e.g., changes in exchange modes or technology).
    * **Systemic Embedding:** How does the subject interact with larger systems like Globalization, Capitalism, or Local Ecosystems?
    * **The Friction Points:** Explicitly list the limitations, bottlenecks, or ethical problems identified by the authors.

    ## 3. The PhD Gap Finder (Research Roadmap)
    Propose three distinct paths for a new Doctoral Thesis based on this paper:
    * **Methodological Path:** How could a change in tools (e.g., shifting to Longitudinal studies or Big Data) yield different results?
    * **Contextual Path:** What happens if this study is moved to a different geography, demographic, or industry?
    * **Technological/Temporal Path:** How have recent advancements (AI, Digital Finance, etc.) rendered these findings incomplete?

    ## 4. Technical Reference & Synthesis
    * **Domain-Specific Metrics:** List any unique units of measurement, variables, or traditional systems mentioned.
    * **Intellectual Lineage:** Identify the "Authority Figures" (highly cited scholars) who form the foundation of this paper's argument.
    * **Primary Data Synthesis:** Create a Markdown table summarizing the core datasets (e.g., study locations, schedules, or product types).

    # Constraints
    * Use professional, academic tone.
    * Prioritize scannability with bold text and bullet points.
    """ 
    # Cap text to first 100k chars for memory safety on Free Tier
    safe_text = text[:100000]
    return await router.route_task("summarize", prompt, f"Research paper content:\n\n{safe_text}")

async def synthesize_papers(papers: list[dict]):
    """
    Synthesize multiple research papers into a comparative matrix.
    papers: list of {'name': str, 'text': str}
    """
    router = get_agent_router()
    
    context = ""
    for idx, p in enumerate(papers):
        context += f"--- PAPER {idx+1}: {p['name']} ---\n{p['text'][:8000]}\n\n"
    
    prompt = """
    Analyze and synthesize the following multiple research papers. 
    1. Create a "Comparative Research Matrix" in a professional Markdown Table.
    2. The table should compare: Research Objective, Methodology, Target Population, Key Findings, and Primary Contributions.
    3. After the table, provide a "Meta-Synthesis" section that identifies:
        - Universal Themes across all papers
        - Major Contradictions or differing theoretical perspectives
        - Collective Research Gaps for Future Investigators
      
    Use the highest level of professional academic language.
    """
    
    return await router.route_task("synthesize", prompt, context)

async def research_chat(query: str, paper_content: str):
    """
    Answer user questions based on the provided research paper content.
    """
    router = get_agent_router()
    prompt = f"You are a professional research assistant. Based ONLY on the provided research paper content, answer the following user question: {query}\n\nIf the information is not in the text, state that clearly."
    return await router.route_task("question", prompt, paper_content)

async def analyze_journal_paper(text: str):
    """Analyze journal paper using the unified agent."""
    router = get_agent_router()
    
    prompt = """
    # Role
    You are an elite Multi-Disciplinary Research Scientist and PhD Mentor. Your goal is to deconstruct the provided research paper into its core intellectual components. You do not summarize; you critically audit the methodology, theory, and data to find "scholarly leverage points" for a new researcher.

    # Task Instructions
    Perform a structural audit of the attached paper using the following format:

    ## 0. Bibliographic Metadata
    * **Title:** [Full Title]
    * **Authors & Affiliations:** [Primary Authors and Institutional Background]
    * **Publication Context:** [Journal Name, Volume, and Year]

    ## 1. Structural Deconstruction (The Audit)
    * **The Problem Statement:** Identify the specific real-world or theoretical void this paper attempts to fill.
    * **Methodological Rigor:** Identify the exact research design (e.g., Case Study, Experimental, Ethnographic). Audit the sampling strategy and data collection tools.
    * **Theoretical Lens:** What underlying theory or "school of thought" is used to interpret the data?
    * **Evidence Chain:** How do the authors move from raw data to their final conclusion? Is the logic sound or are there "leaps of faith"?

    ## 2. Innovation & Change Analysis
    * **Evolutionary Markers:** Identify where the paper shows a shift from tradition to modernity (e.g., changes in exchange modes or technology).
    * **Systemic Embedding:** How does the subject interact with larger systems like Globalization, Capitalism, or Local Ecosystems?
    * **The Friction Points:** Explicitly list the limitations, bottlenecks, or ethical problems identified by the authors.

    ## 3. The PhD Gap Finder (Research Roadmap)
    Propose three distinct paths for a new Doctoral Thesis based on this paper:
    * **Methodological Path:** How could a change in tools (e.g., shifting to Longitudinal studies or Big Data) yield different results?
    * **Contextual Path:** What happens if this study is moved to a different geography, demographic, or industry?
    * **Technological/Temporal Path:** How have recent advancements (AI, Digital Finance, etc.) rendered these findings incomplete?

    ## 4. Technical Reference & Synthesis
    * **Domain-Specific Metrics:** List any unique units of measurement, variables, or traditional systems mentioned.
    * **Intellectual Lineage:** Identify the "Authority Figures" (highly cited scholars) who form the foundation of this paper's argument.
    * **Primary Data Synthesis:** Create a Markdown table summarizing the core datasets (e.g., study locations, schedules, or product types).

    # Constraints
    * Use professional, academic tone.
    * Prioritize scannability with bold text and bullet points.
    """
    
    # Cap text to first 100k chars for memory safety on Free Tier
    safe_text = text[:100000]
    return await router.route_task("analyze", prompt, safe_text)

async def research_proposal_guide(topic: str):
    """Generate research proposal guide using the unified agent."""
    router = get_agent_router()
    prompt = f"""
    # Role
    You are an elite Multi-Disciplinary Research Scientist and PhD Mentor. Your goal is to generate a comprehensive, persuasive, and scientifically rigorous research proposal guide for the topic: "{topic}".

    # Core Principle
    A good research proposal is an **argument**. It must make a persuasive case that the research question is interesting and the study is important. It should be clear, concise, formal, and precise.

    # Mandatory Proposal Components
    Provide detailed instructions and structure for each of the following 11 sections:

    ## 1. Research Title
    * **Constraint:** Must be shorter and clearer (strictly under 20 words).
    * **Goal:** Attractive, descriptive, and promising. Avoid unnecessary punctuation.

    ## 2. Abstract
    * **Constraint:** 100 to 150 words.
    * **Goal:** Concise overview of significance and major contributions.

    ## 3. Introduction and Background
    * **Contents:** State the background (origin, how, why), magnitude of the problem, and context.
    * **Goal:** Define the knowledge gap and how this research fills it. State the rationale for the study.

    ## 4. Statement of the Problem and Significance
    * **Contents:** Magnitude of the topic, clearly stated research problem (question or statement), and evidence justifying the need.
    * **Goal:** Identify the audience and the deficiency in existing evidence.

    ## 5. Research Objectives
    * **Main Objective:** A single goal related to the problem and main question.
    * **Specific Objectives:** 2-3 specific sub-goals contributing to the main objective.

    ## 6. Literature Review and Theoretical Background
    * **Theoretical Background:** Review broad literature to ascertain the theory/framework.
    * **Empirical Review:** Review closely related work to find the research gap.
    * **Goal:** Critical evaluation of past works; show where this work fits.

    ## 7. Research Methodology
    * **Components:** Define the Cognitive Mode (learning process), Theoretical Perspective (assumptions/paradigm), Ad Hoc Procedures (stratagems/tricks), and Formal Procedural Steps.
    * **Contents:** Research design, methods (interviews, etc.), sampling, and ethical standards.

    ## 8. Policy Implications and Feedbacks
    * **Goal:** How results influence policy-makers and how feedback is communicated to the community.

    ## 9. Timetable
    * **Goal:** A realistic, scheduled series of events (Activity, When, Where).

    ## 10. Budget
    * **Goal:** Detailed description of all costs (travel, stationery, food, etc.).

    ## 11. References
    * **Constraint:** Alphabetical order using a consistent style (e.g., APA, MLA).

    # Final Instructions
    * Ensure the guide is structured as a series of actionable instructions for the researcher.
    * Use professional Markdown formatting with clear headings and subheadings.
    """
    return await router.route_task("write", prompt, "")

async def correct_ocr_text(text: str):
    """Correct OCR text using the unified agent."""
    router = get_agent_router()
    prompt = "Fix OCR errors (typos, misread characters) in the following text while preserving formatting. Return ONLY corrected Markdown text:\n\n"
    return await router.route_task("correct", prompt, text)

async def extract_formulas_as_latex(text: str):
    """Extract formulas as LaTeX using the unified agent."""
    router = get_agent_router()
    prompt = "Identify mathematical formulas in the following text and convert them to LaTeX. Return the full text with LaTeX formulas. Use plain text formatting for everything else, no ** bolding:\n\n"
    return await router.route_task("latex", prompt, text)

# Agent router management functions
async def list_agents():
    """List all configured agents (simplified setup)."""
    router = get_agent_router()
    return router.list_agents()

async def get_agent_status():
    """Get status of the unified Agent Router."""
    router = get_agent_router()
    agents = router.list_agents()
    
    status = {
        "agent_router_enabled": True,
        "total_agents": len(agents),
        "agents": agents,
        "model": router.model,
        "base_url": router.base_url
    }
    
    return status
