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
    return await router.route_task("summarize", prompt, f"Research paper content:\n\n{text}")

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
    
    return await router.route_task("analyze", prompt, text)

async def research_proposal_guide(topic: str):
    """Generate research proposal guide using the unified agent."""
    router = get_agent_router()
    prompt = f"Provide a detailed research proposal writing guide for the following topic: {topic}. Include sections like Introduction, Literature Review, Methodology, and Expected Outcomes. Use professional Markdown formatting with headings and subheadings."
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
