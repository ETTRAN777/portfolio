#!/usr/bin/env node
// Fetches recent public GitHub events for a curated list of repos using
// the Actions-provided token (5,000 req/hr, vs 60/hr unauthenticated) and
// writes a normalized cache file that script.js reads client-side with a
// single free fetch() — no GitHub API calls happen in the visitor's
// browser at all.
//
// Each run MERGES freshly-fetched events into whatever's already in
// activity-cache.json (deduped by URL) rather than replacing it — so a
// quiet day, or a repo that only gets occasional commits, doesn't shrink
// the feed. History accumulates up to MAX_TOTAL_EVENTS, then the oldest
// entries roll off.
//
// Run manually for local testing:
//   GITHUB_TOKEN=ghp_xxx node scripts/fetch-activity.js
// (a token isn't strictly required — the script falls back to
// unauthenticated requests — but you'll hit the 60/hr limit fast.)
//
// Run in CI: see .github/workflows/update-activity.yml

const fs = require('fs');
const path = require('path');

// Add/remove "owner/repo" here to change which repos feed the Activity
// section. No other code needs to change.
const REPOS = ['ettran777/portfolio', 'ettran777/aquariumTool', 'ettran777/SushiKing'];

const CACHE_PATH = path.join(__dirname, '..', 'activity-cache.json');
const MAX_EVENTS_PER_REPO = 15; // how many of each repo's most recent events to pull per run
const MAX_TOTAL_EVENTS = 50; // retention cap across all repos combined, after merging with history
const TOKEN = process.env.GITHUB_TOKEN;

function repoShortName(fullName) {
  return fullName.split('/')[1] || fullName;
}

const MAX_EXTRA_LENGTH = 600; // caps how much of a long PR/release/issue body gets stored

function truncate(str) {
  if (!str) return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  return trimmed.length > MAX_EXTRA_LENGTH ? `${trimmed.slice(0, MAX_EXTRA_LENGTH).trim()}…` : trimmed;
}

// Mirrors the shape script.js expects — message/repo/extra text here is
// raw, UNescaped plain text. Escaping happens exactly once, client-side,
// at render time, so this file stays human-readable if you ever open it.
//
// extra/extraLabel carry whatever additional body text a source has:
// a push's later "-m" messages become "Patch notes", a PR/release/issue's
// description becomes "Details". Both surface in the modal in script.js.
function normalizeEvent(event) {
  const repo = repoShortName(event.repo.name);
  const base = { source: 'github', repo, date: event.created_at };

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload.commits || [];
      if (!commits.length) return null;
      const latest = commits[commits.length - 1];
      const lines = (latest.message || '').split('\n');
      const firstLine = lines[0];
      // `git commit -m "Title" -m "body 1" -m "body 2"` joins subsequent
      // -m messages as separate paragraphs after the first line — that's
      // exactly what we want to surface as patch notes.
      const patchNotes = truncate(lines.slice(1).join('\n'));
      const count = event.payload.size || commits.length;
      return {
        ...base,
        tagClass: 'push',
        tagLabel: 'PUSH',
        message: count > 1
          ? `Pushed ${count} commits — latest: "${firstLine}"`
          : `Pushed a commit: "${firstLine}"`,
        extra: patchNotes,
        extraLabel: patchNotes ? 'Patch notes' : null,
        url: latest.sha ? `https://github.com/${event.repo.name}/commit/${latest.sha}` : null,
      };
    }
    case 'PullRequestEvent': {
      const pr = event.payload.pull_request;
      const details = truncate(pr.body);
      if (event.payload.action === 'opened') {
        return { ...base, tagClass: 'pr', tagLabel: 'PR', message: `Opened PR #${pr.number}: "${pr.title}"`, extra: details, extraLabel: details ? 'Details' : null, url: pr.html_url };
      }
      if (event.payload.action === 'closed') {
        const verb = pr.merged ? 'Merged' : 'Closed';
        return { ...base, tagClass: 'pr', tagLabel: 'PR', message: `${verb} PR #${pr.number}: "${pr.title}"`, extra: details, extraLabel: details ? 'Details' : null, url: pr.html_url };
      }
      return null;
    }
    case 'ReleaseEvent': {
      if (event.payload.action !== 'published') return null;
      const rel = event.payload.release;
      const details = truncate(rel.body);
      return {
        ...base,
        tagClass: 'release',
        tagLabel: 'RELEASE',
        message: `Published release ${rel.tag_name}${rel.name ? `: "${rel.name}"` : ''}`,
        extra: details,
        extraLabel: details ? 'Release notes' : null,
        url: rel.html_url,
      };
    }
    case 'IssuesEvent': {
      if (!['opened', 'closed'].includes(event.payload.action)) return null;
      const issue = event.payload.issue;
      const verb = event.payload.action === 'opened' ? 'Opened' : 'Closed';
      const details = truncate(issue.body);
      return {
        ...base,
        tagClass: 'issue',
        tagLabel: 'ISSUE',
        message: `${verb} issue #${issue.number}: "${issue.title}"`,
        extra: details,
        extraLabel: details ? 'Details' : null,
        url: issue.html_url,
      };
    }
    default:
      return null;
  }
}

async function fetchRepoEvents(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}/events`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-activity-fetcher',
    },
  });
  if (!res.ok) throw new Error(`${repo}: ${res.status} ${res.statusText}`);
  const raw = await res.json();
  return raw.map(normalizeEvent).filter(Boolean).slice(0, MAX_EVENTS_PER_REPO);
}

function loadExistingCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return { generatedAt: null, events: [] };
  }
}

// Stable identity for an event so repeated runs don't duplicate the same
// commit/PR/release/issue. Falls back to repo+date+message for the rare
// case a normalized event has no url (shouldn't happen currently, but
// keeps this safe if a future event type doesn't set one).
function eventKey(event) {
  return event.url || `${event.repo}|${event.date}|${event.message}`;
}

async function main() {
  const existing = loadExistingCache();

  const allEvents = [];
  for (const repo of REPOS) {
    const shortName = repoShortName(repo);
    try {
      const events = await fetchRepoEvents(repo);
      allEvents.push(...events);
      console.log(`✓ ${repo}: ${events.length} events fetched`);
    } catch (err) {
      // GitHub having a bad day (rate limit, outage, typo'd repo name) —
      // just log it. Existing cached events for this repo survive below
      // regardless, since we merge against the full previous cache next.
      console.warn(`✗ ${repo} failed (${err.message})`);
    }
  }

  // Merge freshly-fetched events with everything already cached, so a
  // quiet day (or a repo with infrequent commits) doesn't shrink the
  // feed — history accumulates across runs instead of being replaced.
  const merged = new Map();
  for (const event of [...(existing.events || []), ...allEvents]) {
    merged.set(eventKey(event), event);
  }

  const deduped = Array.from(merged.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_TOTAL_EVENTS);

  const output = {
    generatedAt: new Date().toISOString(),
    events: deduped,
  };

  fs.writeFileSync(CACHE_PATH, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${deduped.length} events to ${CACHE_PATH} (${allEvents.length} freshly fetched this run)`);
}

main().catch((err) => {
  console.error('Fatal error building activity cache:', err);
  process.exit(1);
});