#!/usr/bin/env python3

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

API_BASE = os.environ.get("SCRATCH_API", "https://api.scratch.mit.edu").rstrip("/")
USER_AGENT = "weather-sunny-portfolio-sync/1.0 (+https://weather-sunny.netlify.app)"
PAGE_SIZE = 40
DEFAULT_USER = "weather_sunny"
DEFAULT_OUT = "data"


class SyncError(Exception):
    pass


def log(message, quiet=False, stream=sys.stdout):
    if not quiet:
        print(message, file=stream, flush=True)


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def http_get_json(url, timeout=15.0, retries=3, backoff=1.5, quiet=False):
    last = None
    for attempt in range(1, retries + 1):
        request = urllib.request.Request(url, headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        })
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                if response.status != 200:
                    raise SyncError("HTTP %s for %s" % (response.status, url))
                payload = response.read().decode("utf-8")
            return json.loads(payload)
        except urllib.error.HTTPError as error:
            last = SyncError("HTTP %s for %s" % (error.code, url))
            if error.code == 404:
                raise last
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            last = SyncError("network error for %s: %s" % (url, error))
        except json.JSONDecodeError as error:
            last = SyncError("invalid JSON from %s: %s" % (url, error))

        if attempt < retries:
            delay = backoff ** attempt
            log("  retry %d/%d in %.1fs (%s)" % (attempt, retries - 1, delay, last), quiet, sys.stderr)
            time.sleep(delay)

    raise last if last else SyncError("unknown error for %s" % url)


def pick_image(images, fallback):
    if isinstance(images, dict):
        for key in ("282x218", "216x163", "200x151", "144x108", "135x102", "100x80"):
            if images.get(key):
                return images[key]
    return fallback or ""


def clean_text(value, limit=None):
    if not isinstance(value, str):
        return ""
    text = value.replace("\r\n", "\n").replace("\r", "\n").strip()
    if limit and len(text) > limit:
        text = text[:limit].rstrip() + "…"
    return text


def normalize_project(raw):
    history = raw.get("history") or {}
    stats = raw.get("stats") or {}
    project_id = raw.get("id")
    return {
        "id": project_id,
        "title": clean_text(raw.get("title")) or "Untitled",
        "description": clean_text(raw.get("description"), 400),
        "instructions": clean_text(raw.get("instructions"), 400),
        "url": "https://scratch.mit.edu/projects/%s/" % project_id,
        "image": pick_image(raw.get("images"), raw.get("image")),
        "created": history.get("created") or "",
        "modified": history.get("modified") or "",
        "shared": history.get("shared") or "",
        "views": int(stats.get("views") or 0),
        "loves": int(stats.get("loves") or 0),
        "favorites": int(stats.get("favorites") or 0),
        "remixes": int(stats.get("remixes") or 0),
    }


def normalize_profile(raw):
    profile = raw.get("profile") or {}
    history = raw.get("history") or {}
    images = profile.get("images") or {}
    return {
        "id": raw.get("id"),
        "username": raw.get("username") or "",
        "avatar": images.get("90x90") or images.get("60x60") or images.get("55x55") or "",
        "bio": clean_text(profile.get("bio")),
        "status": clean_text(profile.get("status")),
        "country": clean_text(profile.get("country")),
        "joined": history.get("joined") or "",
        "scratchteam": bool(raw.get("scratchteam")),
        "url": "https://scratch.mit.edu/users/%s/" % (raw.get("username") or ""),
    }


def fetch_profile(username, options):
    url = "%s/users/%s" % (API_BASE, urllib.parse.quote(username))
    log("profile  <- %s" % url, options.quiet)
    raw = http_get_json(url, options.timeout, options.retries, quiet=options.quiet)
    if not isinstance(raw, dict) or not raw.get("username"):
        raise SyncError("unexpected profile payload for %s" % username)
    return normalize_profile(raw)


def fetch_projects(username, options):
    collected = []
    seen = set()
    offset = 0
    page = 0

    while page < options.max_pages:
        url = "%s/users/%s/projects?limit=%d&offset=%d" % (
            API_BASE, urllib.parse.quote(username), PAGE_SIZE, offset,
        )
        log("projects <- offset %d" % offset, options.quiet)
        batch = http_get_json(url, options.timeout, options.retries, quiet=options.quiet)
        if not isinstance(batch, list):
            raise SyncError("unexpected projects payload at offset %d" % offset)

        for raw in batch:
            project = normalize_project(raw)
            if project["id"] in seen:
                continue
            seen.add(project["id"])
            collected.append(project)

        page += 1
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    collected.sort(key=lambda p: (p["shared"] or p["created"] or ""), reverse=True)
    return collected


def summarize(projects):
    return {
        "count": len(projects),
        "views": sum(p["views"] for p in projects),
        "loves": sum(p["loves"] for p in projects),
        "favorites": sum(p["favorites"] for p in projects),
        "remixes": sum(p["remixes"] for p in projects),
    }


def serialize(payload, pretty=True):
    if pretty:
        return json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False) + "\n"
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"


def strip_volatile(text):
    try:
        data = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text
    if isinstance(data, dict):
        data.pop("generatedAt", None)
    return json.dumps(data, ensure_ascii=False, sort_keys=True)


def write_json(path, payload, pretty=True, dry_run=False, quiet=False):
    text = serialize(payload, pretty)
    existing = None
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as handle:
                existing = handle.read()
        except OSError:
            existing = None

    if existing is not None and strip_volatile(existing) == strip_volatile(text):
        log("unchanged %s" % path, quiet)
        return False

    if dry_run:
        log("would write %s (%d bytes)" % (path, len(text.encode("utf-8"))), quiet)
        return True

    directory = os.path.dirname(os.path.abspath(path))
    os.makedirs(directory, exist_ok=True)
    temp = "%s.tmp" % path
    with open(temp, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    os.replace(temp, path)
    log("wrote %s (%d bytes)" % (path, len(text.encode("utf-8"))), quiet)
    return True


def build_parser():
    parser = argparse.ArgumentParser(
        prog="sync_scratch.py",
        description="Fetch a Scratch user's profile and projects and write them as static JSON.",
    )
    parser.add_argument("-u", "--user", default=os.environ.get("SCRATCH_USER", DEFAULT_USER),
                        help="Scratch username (env: SCRATCH_USER)")
    parser.add_argument("-o", "--out", default=os.environ.get("SCRATCH_OUT", DEFAULT_OUT),
                        help="output directory for the JSON files (env: SCRATCH_OUT)")
    parser.add_argument("--timeout", type=float, default=15.0, help="per-request timeout in seconds")
    parser.add_argument("--retries", type=int, default=3, help="attempts per request")
    parser.add_argument("--max-pages", type=int, default=10, help="maximum pages of 40 projects to walk")
    parser.add_argument("--compact", action="store_true", help="write minified JSON")
    parser.add_argument("--dry-run", action="store_true", help="fetch and report without writing files")
    parser.add_argument("--soft-fail", action="store_true",
                        help="exit 0 and keep existing files when the API is unreachable")
    parser.add_argument("-q", "--quiet", action="store_true", help="only print errors")
    return parser


def main(argv=None):
    options = build_parser().parse_args(argv)
    started = time.time()

    log("syncing %s" % options.user, options.quiet)

    try:
        profile = fetch_profile(options.user, options)
        projects = fetch_projects(options.user, options)
    except SyncError as error:
        log("error: %s" % error, False, sys.stderr)
        if options.soft_fail:
            log("soft-fail: keeping existing files", options.quiet, sys.stderr)
            return 0
        return 1

    stamp = now_iso()
    totals = summarize(projects)

    profile_payload = {
        "generatedAt": stamp,
        "source": "api.scratch.mit.edu",
        "profile": profile,
        "totals": totals,
    }
    projects_payload = {
        "generatedAt": stamp,
        "source": "api.scratch.mit.edu",
        "username": profile["username"] or options.user,
        "totals": totals,
        "projects": projects,
    }

    changed = 0
    for name, payload in (("profile.json", profile_payload), ("projects.json", projects_payload)):
        if write_json(os.path.join(options.out, name), payload, not options.compact,
                      options.dry_run, options.quiet):
            changed += 1

    log("done: %d projects, %d views, %d loves, %d file(s) changed, %.1fs" % (
        totals["count"], totals["views"], totals["loves"], changed, time.time() - started,
    ), options.quiet)
    return 0


if __name__ == "__main__":
    sys.exit(main())
