#!/usr/bin/env node
// Fetches recent public GitHub events for a curated list of repos using
// the Actions-provided token (5,000 req/hr, vs 60/hr unauthenticated) and
// writes a normalized cache file that script.js reads client-side with a
// single free fetch() — no GitHub API calls happen in the visitor's
// browser at all.
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
const MAX_EVENTS_PER_REPO = 15;
const TOKEN = process.env.GITHUB_TOKEN;

function repoShortName(fullName) {
  return fullName.split('/')[1] || fullName;
}

// Mirrors the shape script.js expects — message/repo text here is raw,
// UNescaped plain text. Escaping happens exactly once, client-side, at
// render time, so this file stays human-readable if you ever open it.
function normalizeEvent(event) {
  const repo = repoShortName(event.repo.name);
  const base = { source: 'github', repo, date: event.created_at };

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload.commits || [];
      if (!commits.length) return null;
      const latest = commits[commits.length - 1];
      const firstLine = (latest.message || '').split('\n')[0];
      const count = event.payload.size || commits.length;
      return {
        ...base,
        tagClass: 'push',
        tagLabel: 'PUSH',
        message: count > 1
          ? `Pushed ${count} commits — latest: "${firstLine}"`
          : `Pushed a commit: "${firstLine}"`,
        url: latest.sha ? `https://github.com/${event.repo.name}/commit/${latest.sha}` : null,
      };
    }
    case 'PullRequestEvent': {
      const pr = event.payload.pull_request;
      if (event.payload.action === 'opened') {
        return { ...base, tagClass: 'pr', tagLabel: 'PR', message: `Opened PR #${pr.number}: "${pr.title}"`, url: pr.html_url };
      }
      if (event.payload.action === 'closed') {
        const verb = pr.merged ? 'Merged' : 'Closed';
        return { ...base, tagClass: 'pr', tagLabel: 'PR', message: `${verb} PR #${pr.number}: "${pr.title}"`, url: pr.html_url };
      }
      return null;
    }
    case 'ReleaseEvent': {
      if (event.payload.action !== 'published') return null;
      const rel = event.payload.release;
      return {
        ...base,
        tagClass: 'release',
        tagLabel: 'RELEASE',
        message: `Published release ${rel.tag_name}${rel.name ? `: "${rel.name}"` : ''}`,
        url: rel.html_url,
      };
    }
    case 'IssuesEvent': {
      if (!['opened', 'closed'].includes(event.payload.action)) return null;
      const issue = event.payload.issue;
      const verb = event.payload.action === 'opened' ? 'Opened' : 'Closed';
      return {
        ...base,
        tagClass: 'issue',
        tagLabel: 'ISSUE',
        message: `${verb} issue #${issue.number}: "${issue.title}"`,
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

async function main() {
  const existing = loadExistingCache();
  const existingByRepo = {};
  for (const event of existing.events || []) {
    (existingByRepo[event.repo] ||= []).push(event);
  }

  const allEvents = [];
  for (const repo of REPOS) {
    const shortName = repoShortName(repo);
    try {
      const events = await fetchRepoEvents(repo);
      allEvents.push(...events);
      console.log(`✓ ${repo}: ${events.length} events`);
    } catch (err) {
      // If GitHub is having a bad day (rate limit, outage, typo'd repo
      // name) we keep that repo's last-known-good events rather than
      // wiping the feed down to nothing.
      console.warn(`✗ ${repo} failed (${err.message}) — keeping previous cached events for this repo`);
      allEvents.push(...(existingByRepo[shortName] || []));
    }
  }

  allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  const output = {
    generatedAt: new Date().toISOString(),
    events: allEvents,
  };

  fs.writeFileSync(CACHE_PATH, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${allEvents.length} events to ${CACHE_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error building activity cache:', err);
  process.exit(1);
});
