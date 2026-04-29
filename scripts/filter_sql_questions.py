#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib


SQL_SLUGS = {"database", "sql"}
SQL_TAG_NAMES = {"database", "sql"}


def is_sql_question(q: dict) -> bool:
    source_meta = q.get("sourceMeta") or {}
    topic_slugs = {str(s).lower() for s in (source_meta.get("topicTagSlugs") or [])}
    if topic_slugs & SQL_SLUGS:
        return True

    tag_names = {str(t).lower() for t in (q.get("tags") or [])}
    if tag_names & SQL_TAG_NAMES:
        return True

    return False


def main() -> None:
    repo_root = pathlib.Path(__file__).resolve().parents[1]
    questions_path = repo_root / "src" / "artifacts" / "questions.json"

    data = json.loads(questions_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise RuntimeError("questions.json is not a JSON array")

    before = len(data)
    filtered = [q for q in data if not is_sql_question(q)]
    after = len(filtered)
    removed = before - after

    questions_path.write_text(json.dumps(filtered, indent=2) + "\n", encoding="utf-8")
    print(f"Removed {removed} SQL/Database questions ({before} -> {after}).")


if __name__ == "__main__":
    main()

