# 📚 StudyMate — Your AI-Powered Study Notes App

StudyMate is a full-stack study notes app: capture notes by subject, get an AI-generated
3-bullet summary + quiz question for any note, and manage everything straight from Claude
Desktop via a custom MCP server.

## Tech stack

| Layer | Tech |
|---|---|
| Landing page | HTML5, CSS3 (Flexbox/Grid, CSS variables, dark mode), vanilla JS |
| Frontend | React 18 + Vite |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Claude integration | Model Context Protocol (MCP) server over stdio |

## Repo structure

```
studymate/
├── landing/            # Part 1 — pure HTML/CSS/JS marketing page
│   ├── index.html
│   ├── style.css
│   └── script.js
├── client/              # Part 2 — React app (Vite)
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       └── components/
│           ├── NoteForm.jsx
│           ├── NoteCard.jsx
│           └── SearchBar.jsx
├── server/              # Parts 3 & 4 — Express + MongoDB + AI
│   ├── server.js
│   ├── models/Note.js
│   ├── routes/notes.js
│   └── .env.example
├── mcp-server/          # Part 5 — MCP server
│   ├── index.js
│   └── package.json
└── README.md            # Part 6
```

---

## 1. Landing page

Pure HTML/CSS/JS — no build step needed.

```bash
cd landing
# just open index.html in your browser, or serve it:
npx serve .
```

Features: hero with a typing-effect pitch, 3 feature cards (CSS Grid/Flexbox), an FAQ
accordion, and a persisted dark-mode toggle. Responsive under 768px.

---

## 2. React client

```bash
cd client
npm install
npm run dev
```

Runs at `http://localhost:5173`. By default it calls the API at
`http://localhost:5000/api` — override with a `.env` file containing
`VITE_API_URL=http://localhost:5000/api` if your server runs elsewhere.

Features: fetches notes on load (`useEffect`), add/edit note form (controlled
components), delete, client-side search filtering by title/subject, loading and
empty states, and a "✨ Summarize" button per note with its own loading state.

---

## 3 & 4. Server (Express + MongoDB + AI)

```bash
cd server
cp .env.example .env   # then fill in MONGODB_URI and ANTHROPIC_API_KEY
npm install
npm start
```

Runs at `http://localhost:5000`.

### `.env.example` explained

| Variable | Purpose |
|---|---|
| `PORT` | Port Express listens on (default `5000`) |
| `MONGODB_URI` | Local (`mongodb://127.0.0.1:27017/studymate`) or Atlas connection string. **URL-encode** any special characters in your Atlas password, and allow `0.0.0.0/0` in Atlas's IP access list for local dev. |
| `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com/), used by the `/summarize` endpoint |

### Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/notes` | List all notes, newest first |
| POST | `/api/notes` | Create a note (`title`, `subject`, `content`) — `400` if title/content empty |
| PUT | `/api/notes/:id` | Update a note (bonus) |
| DELETE | `/api/notes/:id` | Delete a note |
| POST | `/api/notes/:id/summarize` | Send note content to Claude, get back 3 bullets + 1 quiz question, save on the note |

CORS is enabled so the Vite dev server can call the API without issues.

---

## 5. MCP server

```bash
cd mcp-server
npm install
```

Exposes two tools over stdio:

- **`list_notes`** — fetches `GET /api/notes` from the Express API and summarizes them
- **`create_note`** — posts to `POST /api/notes` to add a new note (`title`, `subject`, `content`)

### Connect to Claude Desktop

Add this to your Claude Desktop config
(`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS,
`%APPDATA%\Claude\claude_desktop_config.json` on Windows). **Use an absolute path.**

```json
{
  "mcpServers": {
    "studymate": {
      "command": "node",
      "args": ["/absolute/path/to/studymate/mcp-server/index.js"],
      "env": {
        "STUDYMATE_API_URL": "http://localhost:5000/api"
      }
    }
  }
}
```

Fully restart Claude Desktop after editing the config. Make sure the Express server
(Part 3) is running first, since the MCP tools call it over HTTP.

Then in Claude Desktop, try:

- "What notes do I have?" → calls `list_notes`
- "Add a note about React hooks under Web Dev" → calls `create_note`

**Proof screenshot:** _add your screenshot of the tool call here, e.g._
`![MCP tool call](./docs/mcp-screenshot.png)`

---

## Screenshots

_Add screenshots here before submitting:_

## Screenshots

### App UI
![App UI](./docs/app-ui.png)

### AI Summarize in action
![AI Summary](./docs/ai-summary.png)

### AI Quiz Mode (bonus)
![Quiz Mode](./docs/Quiz.png)

### MCP Inspector — list_notes tool call
![MCP list_notes](./docs/mcp-success.png)

### MCP Inspector — create_note tool call
![MCP create_note](./docs/mcp-success-2.png)

---

## Bonus features implemented

- ✅ Edit/update note end-to-end (`PUT /api/notes/:id`, edit button + form pre-fill in React)
- ✅ Dark mode toggle on the landing page (persisted via `localStorage`)
- ⬜ AI quiz mode (3 MCQs) — not implemented in this pass
- ⬜ Deployment — not implemented in this pass

## Notes for the reviewer

- The AI summarize endpoint calls `claude-sonnet-4-6` via the Anthropic SDK and expects
  strict JSON back (bullets + quizQuestion), which is then persisted onto the note
  document so it survives a page refresh.
- Validation on `POST`/`PUT /api/notes` returns `400` with a JSON `{ error }` body when
  `title` or `content` is empty/whitespace-only.
- MongoDB errors during startup will exit the process with a clear log line rather than
  silently hanging.
