# Claude Code — Collaboration Findings
### biz-nest project · March 2026

---

## Slide 1 — What Is This?

- Live coding session using **Claude Code** (Anthropic's AI CLI)
- Worked directly inside VS Code on a real Next.js 16 / Prisma / Supabase project
- Not a demo — actual production code, actual problems, actual solutions

---

## Slide 2 — Multi-Day Task Management

- Claude maintains **structured to-do lists** for complex, multi-step tasks
- Example: Auth.js v5 migration — 7 discrete steps tracked and executed in order
- Tasks marked complete in real time, nothing dropped between sessions
- Works across days — picks up context where we left off
- **Result:** Major upgrades feel like checklists, not chaos

---

## Slide 3 — Secure by Design

- Claude **refused to read `.env.local`** without explicit permission
- Flagged that secrets were present before touching the file
- Never committed credentials, never suggested storing secrets in code
- When asked to bypass — required clear, conscious authorization from the developer
- **Security is the default, not an afterthought**

---

## Slide 4 — Generated a Page That Just Worked

- Asked Claude to build the **Create Business** admin page from scratch
- Matched the existing design system automatically:
  - Used the same SCSS variables and spacing tokens
  - Glass-morphism card style consistent with every other page
  - Dark mode support out of the box
- No back-and-forth on styling — first version looked and felt native
- **Zero design debt introduced**

---

## Slide 5 — Collaborative Solutioning on the Theme System

- Started with a flash-of-white problem on page load
- Explored 4 options together: `next-themes`, inline scripts, localStorage, cookies
- Debated tradeoffs in plain English — Claude explained each honestly
- Landed on a **3-layer cookie + Redux + server-side class** solution
- No flash, no library dependency, theme persisted in DB per user
- **The back-and-forth produced a better result than either party alone**

---

## Slide 6 — Major Refactors with Relative Ease

Refactors completed this session:

| Refactor | Scope |
|---|---|
| `lib/` folder removal | Restructured entire data layer |
| Admin page slug rework | Schema + API + UI updated together |
| next-auth v4 → Auth.js v5 | 18 files touched, zero broken builds |
| Next.js 15 → 16 | Upgrade + peer dep resolution in minutes |

- Claude reads before it writes — understands existing patterns before changing them
- Handles cross-cutting changes confidently across the full stack
- **Cleaner code, less technical debt, no regressions**

---

## Slide 7 — Future Work: Configuring Agents

- Claude Code supports **multi-agent orchestration** via the Agent SDK
- Opportunity to configure specialized subagents:
  - A dedicated **test runner** agent
  - A **schema migration** agent for Prisma changes
  - A **code review** agent that runs on every PR
- Agents can run in parallel, in isolated git worktrees
- **Next exploration: automate the boring parts of the dev workflow entirely**

---

## Slide 8 — Key Takeaways

- Claude Code is a **pair programmer**, not an autocomplete
- It pushes back, asks clarifying questions, and suggests better approaches
- Best results come from **treating it like a senior dev**, not a tool
- The session produced: 2 major version upgrades, 1 auth migration, a full theme system overhaul, and several new features — in one session
- **Velocity was real. Quality held.**

---

*Generated from live session notes · biz-nest · github.com/ryan2clw/biz-nest*
