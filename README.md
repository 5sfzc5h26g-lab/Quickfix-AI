# QuickFix AI — Secure AI-powered version

## What changed
The browser never receives the OpenAI API key. The website calls `/api/generate`, and the Node/Express server calls the OpenAI Responses API using a private environment variable.

## Files
- `index.html` — website + AI Studio UI
- `server.js` — secure backend
- `package.json` — dependencies/start command
- `.env.example` — shows the variable names only; NO real secret
- `.gitignore` — prevents `.env` from being committed
- `manifest.json`, `sw.js`, `logo.png` — PWA/branding

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put the real API key in `.env` on your own computer.
4. Run `npm install`.
5. Run `npm start`.
6. Open http://localhost:3000

## Deploy
Use a host that supports a Node/Express server and private environment variables. Add:
- OPENAI_API_KEY = your real key
- OPENAI_MODEL = gpt-5.6-luna
- AI_REQUESTS_PER_HOUR = 30

Do NOT paste the key into `index.html`, JavaScript shipped to the browser, GitHub source code, or chat.

## Cost / limits
OpenAI API usage is billed according to the model and token usage. This starter includes a server-side rate limit of 30 AI requests per hour per IP as a basic abuse-control measure. You should also configure account/project spending limits where available.

## Safety
Review AI-generated business copy before sending it to customers. The app is designed to avoid inventing prices, credentials, awards, testimonials, or guarantees.
