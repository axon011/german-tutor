# German Tutor — full-stack multi-agent AI language tutor

Portfolio flagship project for Aravind (axon011). Purpose is twofold:
1. **Close the React/TypeScript/Node gap** in the AI Engineer portfolio (the gap that
   killed the Alago interview). All agent orchestration lives in **TypeScript**, not
   Python — that is deliberate. Do not port agent logic to Python.
2. **B1 → B2 German** for Aravind himself. He is user #1; every feature must be
   something he would use tomorrow morning. No speculative features.

One-line pitch: *Duolingo teaches everyone the same German; ChatGPT forgets your
mistakes. This remembers every mistake you've ever made and builds your curriculum
out of them.*

## Hard constraints

- **Budget ≈ €0.** Free tiers only: Vercel (hosting), Neon/Supabase (Postgres, slice 3),
  Langfuse Cloud (tracing, slice 2), Gemini free-tier API (deployed LLM).
- **Local dev LLM = Claude Code OAuth** via spawning the `claude` CLI (see below).
  Vercel cannot run the CLI, so the deployment uses the Gemini provider.
- Ship in slices; the app must always be deployable. Never let it sit "90% done".

## Stack

Next.js 14+ (App Router) · TypeScript · Tailwind · SSE streaming ·
Zod for LLM output schemas · Drizzle + Postgres (slice 3) · NextAuth (slice 3) ·
Langfuse (slice 2+). Deploy: Vercel.

## Architecture

```
app/
├─ page.tsx                 chat page
├─ layout.tsx
└─ api/chat/route.ts        POST → provider.streamChat → SSE out
components/
├─ Chat.tsx                 message list + input, consumes SSE
└─ MessageBubble.tsx
lib/
├─ llm/
│  ├─ provider.ts           LLMProvider interface — THE seam. All LLM access goes
│  │                        through it. streamChat(system, messages) → AsyncIterable<string>
│  ├─ claude-code.ts        spawns claude CLI (local dev)
│  └─ gemini.ts             HTTPS to Gemini free tier (deployment)
└─ tutor-prompt.ts          system prompt
.env.local                  LLM_PROVIDER=claude-code | gemini
```

### Claude Code CLI provider — known traps (from resume-tailor, do not rediscover)

```
claude -p --output-format stream-json --verbose \
  --append-system-prompt "<tutor prompt>" \
  --strict-mcp-config --mcp-config '{"mcpServers":{}}'
```

- `--strict-mcp-config --mcp-config '{"mcpServers":{}}'` is **mandatory** — without it
  the claude-mem hook poisons `claude -p` and it hangs.
- Windows exit code `0xC0000142` = transient spawn failure → retry once.
- Stateless design: windowed history goes in the prompt each turn. No --resume.

## Agent design (slice 2+)

Per user turn, fan out in parallel (`Promise.all`), but NEVER block the reply on the
Corrector — stream the Conversation reply immediately, corrections annotate 1–2s later:

- **Conversation agent** — dialog at learner's CEFR level. Fast/cheap model.
- **Corrector agent** — returns Zod-validated JSON
  `{errors: [{span, type, correction, explanation}]}`, rendered as inline annotations
  and (slice 3) stored as DB rows. Needs the most accurate model — wrong grammar
  explanations are poison. Skip entirely for trivial messages ("Ja!") via a cheap gate.
- **Level calibrator** — NOT an LLM call per turn; computed from stored error rates,
  or at most every N turns.

## Efficiency rules (decided up front)

- Stream everything; time-to-first-token is the metric that matters.
- Context: last ~10 messages verbatim + rolling summary of older turns (regenerate
  summary every ~10 turns as a cheap background call). Corrector gets current message
  + compact learner-error profile, not full history.
- Prompt layout `[static instructions][dynamic learner profile][messages]` so provider
  prompt-caching slots in later without a rewrite.
- Tutor replies short (2–4 sentences) — cheaper and pedagogically better.
- SRS card generation = batched background job at session end, not inline.

## Slices

1. **Deployed streaming chat** (CURRENT). One Conversation agent, SSE, chat UI,
   ClaudeCodeProvider + GeminiProvider, Vercel deploy (e.g. tutor.aravindpradee.me).
   No auth, no DB. Done = a real 10-minute German conversation on the live URL.
2. **Parallel multi-agent turn.** Conversation + Corrector concurrent; inline error
   annotations (click highlighted span → explanation card); Langfuse per-agent spans.
   The Corrector's error records are the data source for slice 2.5 — design its JSON
   schema with the recommender in mind (error `type` must map to the CEFR grammar map).
2.5. **Recommendation loop ("Heute üben").** Closes the Talk → Extract → Recommend →
   Talk loop that the pitch promises. RULE-BASED recommender, not an LLM: rank error
   categories by frequency × recency-decay against a static CEFR grammar map. Outputs:
   (a) "Heute üben" card — today's focus + the stat that justifies it; (b) 2–3
   micro-drills generated from the learner's own past erroneous sentences (one batched
   LLM call at session end, per efficiency rules); (c) focus injection into the tutor
   prompt ("baue beiläufig Dativ-Präpositionen ins Gespräch ein") so the chat itself
   delivers the recommendation. Error store = localStorage until slice 3's DB replaces
   it behind the same interface. Explainable-by-design — the formula is a portfolio
   talking point, "asked the LLM what to practice" is not.
3. **Persistence + SRS.** Postgres/Drizzle, NextAuth, every correction → error record,
   SM-2 spaced-repetition deck, error-trend dashboard. Recommender reads from the DB
   instead of localStorage; SRS decides *when* to review what the recommender chose.
4. (Later, only if earned) Voice input via Web Speech API; level-assessment onboarding;
   GraphRAG-backed learner-error graph.

## Tutor prompt requirements (slice 1)

Respond in German at B1; 2–4 sentences; gently recast the learner's errors inside the
reply without lecturing (recasting is the slice-1 stand-in for the Corrector); end
every turn with a follow-up question to keep conversation alive.

## Rules

- Repo is public under github.com/axon011 — recruiters will read it. Clean commits,
  real README with architecture diagram once slice 1 ships.
- No Co-Authored-By lines in commits.
- Resume/portfolio claims about this project must match what is actually deployed —
  never claim "production" until it has real uptime; "deployed" is the word.
