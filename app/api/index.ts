// Vercel Function: every /api/* request is rewritten here (see vercel.json) and
// forwarded to the Express app. The app and all routes live in server/src and are
// traced into this function's bundle by Vercel's Node builder (nft).
import app from '../server/src/app.js';

export default app;
