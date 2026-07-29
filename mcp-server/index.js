import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = process.env.STUDYMATE_API_URL || 'http://localhost:5000/api';
const EMAIL = process.env.STUDYMATE_EMAIL;
const PASSWORD = process.env.STUDYMATE_PASSWORD;

let cachedToken = null;

async function login() {
  if (cachedToken) return cachedToken;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log in to StudyMate');
  }

  const data = await res.json();
  cachedToken = data.token;
  return cachedToken;
}

async function authHeaders() {
  const token = await login();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

const server = new Server(
  { name: 'studymate-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: 'list_notes',
    description: 'List all study notes stored in StudyMate, including title, subject, and content.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'create_note',
    description: 'Create a new study note in StudyMate with a title, subject, and content.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the note' },
        subject: { type: 'string', description: 'The subject/category of the note (e.g. Biology, History)' },
        content: { type: 'string', description: 'The body content of the note' },
      },
      required: ['title', 'content'],
      additionalProperties: false,
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_notes') {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/notes`, { headers });
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const notes = await res.json();

      const summary = notes
        .map(
          (n, i) =>
            `${i + 1}. "${n.title}" [${n.subject}]\n   ${n.content.slice(0, 120)}${n.content.length > 120 ? '...' : ''}`
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: notes.length
              ? `You have ${notes.length} note(s):\n\n${summary}`
              : 'You have no notes yet.',
          },
        ],
      };
    }

    if (name === 'create_note') {
      const { title, subject, content } = args;
      const headers = await authHeaders();

      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, subject, content }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API responded with ${res.status}`);
      }

      const created = await res.json();

      return {
        content: [
          {
            type: 'text',
            text: `Created note "${created.title}" under subject "${created.subject}".`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StudyMate MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error in StudyMate MCP server:', err);
  process.exit(1);
});