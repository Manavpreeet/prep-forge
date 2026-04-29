#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass(frozen=True)
class Task:
    id: str
    phase: str
    priority: str
    description: str
    depends_on: Tuple[str, ...]


def _repo_root() -> str:
    here = os.path.abspath(os.path.dirname(__file__))
    return os.path.abspath(os.path.join(here, ".."))


def _load_tasks(path: str) -> Tuple[List[Dict[str, Any]], List[Task]]:
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    phases = raw.get("phases", [])
    tasks_raw = raw.get("tasks", [])
    tasks: List[Task] = []
    for t in tasks_raw:
        tasks.append(
            Task(
                id=t["id"],
                phase=t["phase"],
                priority=t["priority"],
                description=t["description"],
                depends_on=tuple(t.get("depends_on", [])),
            )
        )
    return phases, tasks


def _index(tasks: List[Task]) -> Dict[str, Task]:
    out: Dict[str, Task] = {}
    for t in tasks:
        if t.id in out:
            raise SystemExit(f"Duplicate task id: {t.id}")
        out[t.id] = t
    return out


def _task_state_path() -> str:
    return os.path.join(_repo_root(), "project", "task-state.json")


def _load_state() -> Dict[str, Any]:
    path = _task_state_path()
    if not os.path.exists(path):
        return {"completed": []}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if "completed" not in data or not isinstance(data["completed"], list):
        return {"completed": []}
    return data


def _save_state(state: Dict[str, Any]) -> None:
    path = _task_state_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True)
        f.write("\n")


def _deps_satisfied(task: Task, completed: Set[str]) -> bool:
    return all(dep in completed for dep in task.depends_on)


def _sort_key(t: Task) -> Tuple[int, str]:
    # P0 highest priority
    p = t.priority.strip().upper()
    pnum = int(p[1:]) if p.startswith("P") and p[1:].isdigit() else 99
    return (pnum, t.id)


def cmd_list(phases: List[Dict[str, Any]], tasks: List[Task], args: argparse.Namespace) -> None:
    phase_filter = args.phase
    tasks_f = [t for t in tasks if (phase_filter is None or t.phase == phase_filter)]
    tasks_f.sort(key=_sort_key)

    state = _load_state()
    completed = set(state.get("completed", []))

    for t in tasks_f:
        status = "done" if t.id in completed else "todo"
        deps = ", ".join(t.depends_on) if t.depends_on else "-"
        print(f"[{status}] {t.priority} {t.phase} {t.id}")
        print(f"  - {t.description}")
        print(f"  - depends_on: {deps}")


def cmd_next(phases: List[Dict[str, Any]], tasks: List[Task], args: argparse.Namespace) -> None:
    state = _load_state()
    completed = set(state.get("completed", []))

    remaining = [t for t in tasks if t.id not in completed]
    remaining.sort(key=_sort_key)

    candidates = [t for t in remaining if _deps_satisfied(t, completed)]
    if args.phase is not None:
        candidates = [t for t in candidates if t.phase == args.phase]

    if not candidates:
        print("No runnable tasks (all done, or dependencies not satisfied).")
        return

    t = candidates[0]
    deps = ", ".join(t.depends_on) if t.depends_on else "-"
    print(f"{t.priority} {t.phase} {t.id}")
    print(f"- {t.description}")
    print(f"- depends_on: {deps}")


def cmd_done(phases: List[Dict[str, Any]], tasks: List[Task], args: argparse.Namespace) -> None:
    idx = _index(tasks)
    if args.task_id not in idx:
        raise SystemExit(f"Unknown task id: {args.task_id}")

    state = _load_state()
    completed = set(state.get("completed", []))
    completed.add(args.task_id)
    state["completed"] = sorted(completed)
    _save_state(state)
    print(f"Marked done: {args.task_id}")


def cmd_undone(phases: List[Dict[str, Any]], tasks: List[Task], args: argparse.Namespace) -> None:
    state = _load_state()
    completed = set(state.get("completed", []))
    if args.task_id in completed:
        completed.remove(args.task_id)
    state["completed"] = sorted(completed)
    _save_state(state)
    print(f"Marked todo: {args.task_id}")


def cmd_graph(phases: List[Dict[str, Any]], tasks: List[Task], args: argparse.Namespace) -> None:
    # Simple DOT output for dependency graph visualization.
    tasks_f = tasks
    if args.phase is not None:
        tasks_f = [t for t in tasks if t.phase == args.phase]

    print("digraph tasks {")
    print('  rankdir="LR";')
    for t in tasks_f:
        label = f"{t.id}\\n{t.priority} {t.phase}"
        print(f'  "{t.id}" [label="{label}"];')
    for t in tasks_f:
        for dep in t.depends_on:
            print(f'  "{dep}" -> "{t.id}";')
    print("}")


def main() -> None:
    default_tasks = os.path.join(_repo_root(), "project", "tasks.json")

    parser = argparse.ArgumentParser(prog="tasks.py")
    parser.add_argument("--tasks", default=default_tasks, help="Path to tasks.json")

    sub = parser.add_subparsers(dest="cmd", required=True)

    p_list = sub.add_parser("list", help="List tasks")
    p_list.add_argument("--phase", default=None, help="Filter to a phase (e.g. P1)")

    p_next = sub.add_parser("next", help="Show next runnable task (deps satisfied)")
    p_next.add_argument("--phase", default=None, help="Filter to a phase (e.g. P1)")

    p_done = sub.add_parser("done", help="Mark task completed")
    p_done.add_argument("task_id")

    p_undone = sub.add_parser("undone", help="Mark task as not completed")
    p_undone.add_argument("task_id")

    p_graph = sub.add_parser("graph", help="Output dependency graph (DOT)")
    p_graph.add_argument("--phase", default=None, help="Filter to a phase (e.g. P1)")

    args = parser.parse_args()
    phases, tasks = _load_tasks(args.tasks)

    if args.cmd == "list":
        cmd_list(phases, tasks, args)
    elif args.cmd == "next":
        cmd_next(phases, tasks, args)
    elif args.cmd == "done":
        cmd_done(phases, tasks, args)
    elif args.cmd == "undone":
        cmd_undone(phases, tasks, args)
    elif args.cmd == "graph":
        cmd_graph(phases, tasks, args)
    else:
        raise SystemExit(f"Unknown command: {args.cmd}")


if __name__ == "__main__":
    main()

