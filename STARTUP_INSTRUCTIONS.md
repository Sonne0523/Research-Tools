# Researcher Toolset - Startup Instructions

## Quick Start (Recommended)
Double-click `startup.bat` to start both backend and frontend servers automatically.

## Manual Startup
If you prefer to start servers manually:

### 1. Start Backend (FastAPI)
```cmd
cd F:\Rseacher tools\backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

### 2. Start Frontend (React/Vite)
```cmd
cd F:\Rseacher tools\frontend
npm run dev
```

## Application URLs
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/
- **API Documentation**: http://localhost:8000/docs

## Features Implemented
✅ **UI Improvements**:
- Action buttons now appear horizontally at the top
- Action buttons hide when chatting with AI
- Preview column gets more space than chat column (60/40 split)
- Smooth animations for layout changes
- Responsive design (stacks on mobile)

✅ **AI Backend Change**:
- Switched from OpenRouter (rate-limited) to Ollama (unlimited free)
- Uses your locally installed Ollama with `llama3.2:3b` model
- No more 429 rate limit errors
- Completely free and private AI usage

✅ **Consistency**:
- Applied identical improvements to both SummaryView and AnalysisView
- All original functionality preserved

## Troubleshooting
If you encounter issues:
1. **Ollama not running**: Start Ollama from Start Menu or run `ollama serve`
2. **Port conflicts**: The script will try alternative ports if needed
3. **Backend connection errors**: Verify backend is running on http://localhost:8000
4. **Missing dependencies**: Run `npm install` in frontend and `pip install -r requirements.txt` in backend if needed

## Files Modified
- `backend/app/services/ai_service.py` - Changed to Ollama/OpenAI-compatible API
- `backend/.env` - Updated to Ollama configuration
- `frontend/src/components/SummaryView.tsx` - New layout with hidden buttons during chat
- `frontend/src/components/AnalysisView.tsx` - Same improvements applied
- `frontend/src/index.css` - Added layout styles for two-column layout and button hiding
- `startup.bat` - Convenience script to start both servers