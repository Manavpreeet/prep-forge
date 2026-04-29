# Karpathy — LLM Wiki (source)

Source: `https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`

This file is stored as an **immutable raw source**. Do not edit it; add a new source file if you want to extend/annotate.

## Extract (verbatim)

> A pattern for building personal knowledge bases using LLMs.
>
> Instead of just retrieving from raw documents at query time, the LLM incrementally builds and maintains a persistent wiki — a structured, interlinked collection of markdown files that sits between you and the raw sources.
>
> There are three layers:
>
> **Raw sources** — immutable, source of truth  
> **The wiki** — LLM-generated markdown, maintained over time  
> **The schema** — a document that tells the LLM how the wiki is structured and how to operate it
>
> Two special files:
>
> **index.md** (content-oriented)  
> **log.md** (chronological, append-only)

