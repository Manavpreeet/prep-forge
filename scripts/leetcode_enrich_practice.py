#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import pathlib
import random
import re
import time
import urllib.error
import urllib.request
from collections import defaultdict
from typing import Any, Dict, List

GRAPHQL_URL = "https://leetcode.com/graphql/"

DETAIL_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    content
    difficulty
    hints
    topicTags {
      name
      slug
    }
    exampleTestcases
    sampleTestCase
  }
}
""".strip()


def graphql_post(payload: dict, referer: str) -> dict:
    req = urllib.request.Request(
        GRAPHQL_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Referer": referer,
            "User-Agent": "dsa-helper-enricher/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {exc.code}: {body[:300]}") from exc


def strip_html(value: str) -> str:
    text = re.sub(r"<[^>]+>", " ", value)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_example(content_html: str, example_testcases: str) -> Dict[str, str]:
    text = strip_html(content_html)
    # Try parse from statement first
    input_match = re.search(r"Input:\s*(.+?)\s*Output:", text, flags=re.IGNORECASE)
    output_match = re.search(r"Output:\s*(.+?)(?:\s*Explanation:|\s*Constraints:|$)", text, flags=re.IGNORECASE)
    explanation_match = re.search(r"Explanation:\s*(.+?)(?:\s*Example\s*\d+:|\s*Constraints:|$)", text, flags=re.IGNORECASE)

    if input_match and output_match:
        return {
            "exampleInput": input_match.group(1).strip(),
            "exampleOutput": output_match.group(1).strip(),
            "exampleExplanation": explanation_match.group(1).strip() if explanation_match else "Derived from LeetCode example section.",
        }

    # Fallback to testcases field
    testcase_lines = [line.strip() for line in (example_testcases or "").splitlines() if line.strip()]
    example_input = testcase_lines[0] if testcase_lines else "Refer to LeetCode examples."
    example_output = testcase_lines[1] if len(testcase_lines) > 1 else "Refer to LeetCode examples."
    return {
        "exampleInput": example_input,
        "exampleOutput": example_output,
        "exampleExplanation": "See explanation in LeetCode problem statement.",
    }


def main() -> None:
    random.seed(7)
    root = pathlib.Path(__file__).resolve().parents[1]
    src_questions_path = root / "src" / "artifacts" / "questions.json"
    out_path = root / "src" / "artifacts" / "practiceQuestions.json"

    all_questions: List[Dict[str, Any]] = json.loads(src_questions_path.read_text(encoding="utf-8"))
    # Curate balanced pool by pattern x difficulty.
    buckets: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for q in all_questions:
        if q.get("sourceMeta", {}).get("paidOnly", False):
            continue
        key = f"{q['patternId']}::{q['difficulty']}"
        buckets[key].append(q)

    selected: List[Dict[str, Any]] = []
    per_bucket = 12
    for key, items in buckets.items():
        random.shuffle(items)
        selected.extend(items[:per_bucket])

    # Keep deterministic and unique.
    dedup: Dict[str, Dict[str, Any]] = {}
    for q in selected:
        dedup[q["id"]] = q
    selected = list(dedup.values())

    print(f"Selected {len(selected)} problems for detailed enrichment")
    enriched: List[Dict[str, Any]] = []
    for idx, q in enumerate(selected, start=1):
        slug = q.get("sourceMeta", {}).get("titleSlug")
        if not slug:
            continue
        payload = {"query": DETAIL_QUERY, "variables": {"titleSlug": slug}, "operationName": "questionData"}
        data = graphql_post(payload, f"https://leetcode.com/problems/{slug}/")
        node = data.get("data", {}).get("question")
        if not node:
            continue

        prompt = strip_html(node.get("content") or "")
        parsed = parse_example(node.get("content") or "", node.get("exampleTestcases") or "")
        hints = node.get("hints") or []
        hint = hints[0] if hints else f"Focus on {q['patternId']} and start from constraints."

        enriched.append(
            {
                **q,
                "difficulty": (node.get("difficulty") or q["difficulty"]).lower(),
                "tags": [t["name"] for t in (node.get("topicTags") or [])],
                "prompt": prompt or f"Solve {q['title']} on LeetCode.",
                **parsed,
                "hint": hint,
                "acceptanceRate": q.get("sourceMeta", {}).get("acRate"),
                "sampleTestCase": node.get("sampleTestCase"),
            }
        )
        if idx % 25 == 0:
            print(f"Enriched {idx}/{len(selected)}")
        time.sleep(0.08)

    out_path.write_text(json.dumps(enriched, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(enriched)} detailed practice questions to {out_path}")


if __name__ == "__main__":
    main()

