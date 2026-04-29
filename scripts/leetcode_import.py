#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import urllib.request
import urllib.error
from dataclasses import dataclass
from typing import Dict, List, Optional


GRAPHQL_URL = "https://leetcode.com/graphql/"
PAGE_SIZE = 100


@dataclass(frozen=True)
class Pattern:
    id: str
    name: str
    description: str
    order: int
    recommendedStartLevel: int = 1


PATTERNS: List[Pattern] = [
    Pattern("arrays-hashing", "Arrays & Hashing", "Array operations, hash maps, and counting patterns.", 1),
    Pattern("two-pointers", "Two Pointers", "Dual pointer movement for sorted/sequence problems.", 2),
    Pattern("sliding-window", "Sliding Window", "Dynamic/fixed window over arrays or strings.", 3),
    Pattern("binary-search", "Binary Search", "Search space narrowing over ordered domains.", 4),
    Pattern("linked-list", "Linked List", "Traversal and manipulation of linked nodes.", 5),
    Pattern("trees", "Trees", "Tree traversals, recursion, and tree properties.", 6),
    Pattern("graphs", "Graphs", "Graph traversal, shortest path, and connectivity.", 7),
    Pattern("backtracking", "Backtracking", "State-space search with pruning.", 8),
    Pattern("dynamic-programming", "Dynamic Programming", "Optimal substructure with memo/tabulation.", 9),
    Pattern("greedy", "Greedy", "Locally optimal choices for global objective.", 10),
    Pattern("intervals", "Intervals", "Merge/sweep/overlap interval reasoning.", 11),
    Pattern("heap-priority-queue", "Heap / Priority Queue", "Top-k, streaming order statistics.", 12),
]


TAG_TO_PATTERN: Dict[str, str] = {
    "array": "arrays-hashing",
    "hash-table": "arrays-hashing",
    "string": "arrays-hashing",
    "sorting": "arrays-hashing",
    "counting": "arrays-hashing",
    "prefix-sum": "arrays-hashing",
    "two-pointers": "two-pointers",
    "sliding-window": "sliding-window",
    "binary-search": "binary-search",
    "linked-list": "linked-list",
    "tree": "trees",
    "binary-tree": "trees",
    "binary-search-tree": "trees",
    "n-ary-tree": "trees",
    "graph": "graphs",
    "depth-first-search": "graphs",
    "breadth-first-search": "graphs",
    "union-find": "graphs",
    "topological-sort": "graphs",
    "shortest-path": "graphs",
    "backtracking": "backtracking",
    "recursion": "backtracking",
    "dynamic-programming": "dynamic-programming",
    "memoization": "dynamic-programming",
    "greedy": "greedy",
    "interval": "intervals",
    "line-sweep": "intervals",
    "heap-priority-queue": "heap-priority-queue",
    "design": "heap-priority-queue",
    "stack": "arrays-hashing",
    "queue": "arrays-hashing",
    "matrix": "arrays-hashing",
    "bit-manipulation": "arrays-hashing",
    "math": "arrays-hashing",
    "simulation": "arrays-hashing",
    "ordered-set": "heap-priority-queue",
    "data-stream": "heap-priority-queue",
    "segment-tree": "trees",
    "binary-indexed-tree": "trees",
    "trie": "trees",
    "monotonic-stack": "intervals",
    "monotonic-queue": "sliding-window",
    "string-matching": "sliding-window",
    "rolling-hash": "sliding-window",
    "divide-and-conquer": "binary-search",
    "combinatorics": "backtracking",
    "bitmask": "backtracking",
    "number-theory": "dynamic-programming",
}


QUERY = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      title
      titleSlug
      difficulty
      isPaidOnly
      questionFrontendId
      acRate
      topicTags {
        name
        slug
      }
    }
  }
}
""".strip()


def graphql_post(payload: dict) -> dict:
    req = urllib.request.Request(
        GRAPHQL_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/problemset/",
            "User-Agent": "dsa-helper-importer/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"LeetCode GraphQL HTTP {exc.code}: {body[:500]}") from exc


def map_pattern(tag_slugs: List[str], title: str) -> str:
    # Vote across all tags so ordering of LeetCode tags does not dominate mapping.
    votes: Dict[str, int] = {}
    for slug in tag_slugs:
        pattern = TAG_TO_PATTERN.get(slug)
        if pattern:
            votes[pattern] = votes.get(pattern, 0) + 1

    if votes:
        ranked = sorted(votes.items(), key=lambda item: (-item[1], item[0]))
        return ranked[0][0]

    # Heuristics fallback by title keywords
    title_l = title.lower()
    if "window" in title_l:
        return "sliding-window"
    if "pointer" in title_l:
        return "two-pointers"
    if "tree" in title_l:
        return "trees"
    if "graph" in title_l:
        return "graphs"
    if "interval" in title_l:
        return "intervals"

    return "arrays-hashing"


def to_level(difficulty: str) -> int:
    return {"Easy": 1, "Medium": 2, "Hard": 3}.get(difficulty, 2)


def fetch_all_questions() -> List[dict]:
    all_questions: List[dict] = []
    skip = 0
    total: Optional[int] = None

    while True:
        payload = {
            "query": QUERY,
            "variables": {
                "categorySlug": "",
                "skip": skip,
                "limit": PAGE_SIZE,
                "filters": {},
            },
            "operationName": "problemsetQuestionList",
        }
        data = graphql_post(payload)
        if data.get("errors"):
            raise RuntimeError(f"GraphQL errors: {data['errors']}")

        block = data["data"]["problemsetQuestionList"]
        questions = block["questions"]
        total = block["total"] if total is None else total

        if not questions:
            break

        all_questions.extend(questions)
        skip += len(questions)
        print(f"Fetched {skip}/{total}")
        if skip >= total:
            break

    return all_questions


def build_artifacts(raw_questions: List[dict]) -> List[dict]:
    transformed: List[dict] = []
    for q in raw_questions:
        tags = q.get("topicTags") or []
        tag_slugs = [t["slug"] for t in tags]
        if "database" in tag_slugs or "sql" in tag_slugs:
            continue
        mapped_pattern = map_pattern(tag_slugs, q.get("title", ""))
        diff = q.get("difficulty", "Medium")

        transformed.append(
            {
                "id": f"leetcode-{q['titleSlug']}",
                "title": q["title"],
                "patternId": mapped_pattern,
                "difficulty": diff.lower(),
                "level": to_level(diff),
                "url": f"https://leetcode.com/problems/{q['titleSlug']}/",
                "platform": "leetcode",
                "tags": [t["name"] for t in tags],
                "prerequisites": [],
                "estimatedMinutes": {"Easy": 20, "Medium": 35, "Hard": 50}.get(diff, 35),
                "sourceMeta": {
                    "frontendQuestionId": str(q.get("frontendQuestionId", "")),
                    "questionFrontendId": str(q.get("questionFrontendId", "")),
                    "titleSlug": q.get("titleSlug"),
                    "paidOnly": bool(q.get("isPaidOnly", False)),
                    "acRate": q.get("acRate"),
                    "topicTagSlugs": tag_slugs,
                },
            }
        )
    return transformed


def write_json(path: pathlib.Path, obj: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2), encoding="utf-8")
    path.write_text(path.read_text(encoding="utf-8") + "\n", encoding="utf-8")


def main() -> None:
    repo_root = pathlib.Path(__file__).resolve().parents[1]
    artifacts_dir = repo_root / "src" / "artifacts"

    print("Fetching LeetCode question metadata...")
    raw_questions = fetch_all_questions()
    transformed = build_artifacts(raw_questions)
    patterns_payload = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "order": p.order,
            "recommendedStartLevel": p.recommendedStartLevel,
        }
        for p in PATTERNS
    ]

    write_json(artifacts_dir / "leetcodeRawQuestions.json", raw_questions)
    write_json(artifacts_dir / "questions.json", transformed)
    write_json(artifacts_dir / "patterns.json", patterns_payload)
    write_json(artifacts_dir / "patternTagMap.json", TAG_TO_PATTERN)

    print(f"Wrote {len(transformed)} mapped questions into {artifacts_dir}")


if __name__ == "__main__":
    main()

