# DSA Helper — Wiki Overview

DSA Helper is a **local-first** DSA practice coach focused on **pattern mastery** (not random grinding).

## Core loop

Choose pattern → Solve question → Mark result → Update progress → Recommend next best question

## Key product ideas

- Pattern-based practice modes:
  - **Pattern practice**: pick a pattern, progress easy → medium → hard adaptively.
  - **Random practice**: not uniform random; prioritize weak/in-progress/unexplored patterns.
- Supportive UX:
  - “failure means we found the right practice point”
  - reinforcement questions after misses
- Storage:
  - `localStorage` for lightweight progress
  - later `IndexedDB` for embeddings/semantic index/model metadata

## Planned architecture (once the app exists)

- UI: React + Vite + TypeScript, Tailwind, React Router
- State: Zustand
- Charts: Recharts
- Engines:
  - question selection
  - progress & streaks
  - weakness detection
  - pattern tree progression
  - motivation messaging

