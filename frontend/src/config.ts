// Production Render URL: https://research-tools.onrender.com
// Local URL: http://localhost:8000

const IS_PROD = true; // Set to true for production deployment

export const API_BASE_URL = IS_PROD 
  ? 'https://research-tools-1.onrender.com' 
  : 'http://localhost:8000';

export const WS_BASE_URL = IS_PROD 
  ? 'wss://research-tools-1.onrender.com' 
  : 'ws://localhost:8000';
