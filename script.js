// Highlight nav link based on scroll position
const sections = Array.from(document.querySelectorAll("section[id], .contact-section"));
const navLinks = document.querySelectorAll("#navbar a");

function highlightNav() {
  const scrollY = window.pageYOffset;
  const path = window.location.pathname;
  const isGallery = path.includes("gallery.html");
  const isVolare = path.includes("volare.html");
  const isDebt = path.includes("debtAndTaxes.html");
  let topNavId = "hero";
  if (isGallery) topNavId = "subhero";
  if (isVolare) topNavId = "volare";
  if (isDebt) topNavId = "debtAndTaxes";

  let activeSet = false;

  // If at the bottom of the page, always highlight Contact
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (
        (link.getAttribute("href") && link.getAttribute("href").includes("contact")) ||
        (link.getAttribute("onclick") && link.getAttribute("onclick").includes("contact"))
      ) {
        link.classList.add("active");
        activeSet = true;
      }
    });
    return;
  }

  // Check if Contact section is in view
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    const top = contactSection.offsetTop - 100;
    const height = contactSection.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (
          (link.getAttribute("href") && link.getAttribute("href").includes("contact")) ||
          (link.getAttribute("onclick") && link.getAttribute("onclick").includes("contact"))
        ) {
          link.classList.add("active");
          activeSet = true;
        }
      });
      return;
    }
  }

  // Check for top section (Home, Gallery, Volare, Debt and Taxes)
  const topSection = document.getElementById(topNavId);
  if (topSection && scrollY < topSection.offsetTop + topSection.offsetHeight - 100) {
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (
        (link.getAttribute("href") && link.getAttribute("href").includes(topNavId)) ||
        (link.getAttribute("onclick") && link.getAttribute("onclick").includes(topNavId))
      ) {
        link.classList.add("active");
        activeSet = true;
      }
    });
    return;
  }

  // Otherwise, highlight based on section in view
  let found = false;
  for (let sec of sections) {
    const top = sec.offsetTop - 100;
    const height = sec.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (
          (link.getAttribute("href") && link.getAttribute("href").includes(sec.id)) ||
          (link.getAttribute("onclick") && link.getAttribute("onclick").includes(sec.id))
        ) {
          link.classList.add("active");
          activeSet = true;
        }
      });
      found = true;
      break;
    }
  }

  // For volare.html and debtAndTaxes.html, ensure Contact is not highlighted unless actually in contact section
  if ((isVolare || isDebt) && !activeSet) {
    navLinks.forEach(link => {
      if (
        (link.getAttribute("href") && link.getAttribute("href").includes("contact")) ||
        (link.getAttribute("onclick") && link.getAttribute("onclick").includes("contact"))
      ) {
        link.classList.remove("active");
      }
    });
  }
}

window.addEventListener("scroll", highlightNav);
document.addEventListener("DOMContentLoaded", highlightNav);

function scrollToSection(element) {
  if(element === "resume") {
    element = "skills";
  }
  const target = document.getElementById(element);
  if (target) {
    target.scrollIntoView({
      behavior: "smooth"
    });
  }
}

/* =========================================
   MOBILE NAVIGATION LOGIC
   ========================================= */
// Built from #navbar's own links on every page, so the desktop and mobile
// menus can never drift apart and each page only lists its links once.
// The hamburger/drawer/overlay are hidden by CSS above 768px.
function buildMobileNav() {
  const desktopNav = document.getElementById('navbar');
  if (!desktopNav) return;

  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.className = 'overlay';

  const navToggle = document.createElement('button');
  navToggle.id = 'navToggle';
  navToggle.type = 'button';
  navToggle.setAttribute('aria-label', 'Open menu');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-controls', 'mobileNavContainer');
  navToggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

  const mobileNav = document.createElement('nav');
  mobileNav.id = 'mobileNavContainer';
  mobileNav.setAttribute('aria-label', 'Mobile');
  mobileNav.inert = true; // off-screen links stay out of the Tab order while closed
  const list = document.createElement('ul');
  list.id = 'mobile-nav-list';
  desktopNav.querySelectorAll('a').forEach((link) => {
    const li = document.createElement('li');
    const copy = link.cloneNode(true);
    copy.classList.remove('active');
    li.appendChild(copy);
    list.appendChild(li);
  });
  mobileNav.appendChild(list);

  document.body.prepend(overlay, navToggle, mobileNav);

  let closeTimer;
  function setOpen(open) {
    clearTimeout(closeTimer);
    mobileNav.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    mobileNav.inert = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      navToggle.classList.add('open'); // bring bars together...
      closeTimer = setTimeout(() => navToggle.classList.add('animate-x'), 200); // ...then rotate to X
    } else {
      navToggle.classList.remove('animate-x');
      closeTimer = setTimeout(() => navToggle.classList.remove('open'), 200);
    }
  }
  const isOpen = () => mobileNav.classList.contains('open');

  navToggle.addEventListener('click', () => setOpen(!isOpen()));
  overlay.addEventListener('click', () => setOpen(false));
  list.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); navToggle.focus(); }
  });
}
buildMobileNav();

// Gallery popup modal for .galleryItem
document.addEventListener("DOMContentLoaded", () => {
  // Create modal elements
  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <span class="gallery-modal-close">&times;</span>
      <img alt="Gallery Image" class="gallery-modal-img" />
      <div class="gallery-modal-caption"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector(".gallery-modal-img");
  const modalCaption = modal.querySelector(".gallery-modal-caption");
  const closeBtn = modal.querySelector(".gallery-modal-close");

  function openModalFor(item) {
    const img = item.querySelector('img');
    const fallbackCaption = item.querySelector('p');
    const detailedCaption = img.getAttribute('data-caption');

    modalImg.src = img.src;
    modalImg.alt = img.alt || '';

    modalCaption.textContent = detailedCaption || (fallbackCaption ? fallbackCaption.textContent : '');

    modal.classList.add('open');
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = "";
  }

  // Open modal on galleryItem click — also keyboard-accessible (Tab to
  // focus, Enter/Space to open), since these are plain divs rather than
  // native buttons/links and wouldn't otherwise be reachable without a
  // mouse.
  document.querySelectorAll('.galleryItem').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    const caption = item.querySelector('p');
    if (caption) item.setAttribute('aria-label', `View image: ${caption.textContent}`);

    item.addEventListener('click', () => openModalFor(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModalFor(item);
      }
    });
  });

  // Close modal on close button, outside click, or Escape key
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
});

/* =========================================
   TYPING ANIMATIONS
   Hero boot sequence + section-header reveals.
   Respects prefers-reduced-motion — skips straight
   to final text if the user has that set.
   ========================================= */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeInto(el, text, speed, onDone) {
  if (prefersReducedMotion) {
    el.textContent = text;
    if (onDone) onDone();
    return;
  }
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else if (onDone) {
      onDone();
    }
  })();
}

// Hero boot sequence: type "whoami" at the prompt, then the name types in
// as if it were the command's output, then role tags reveal one by one.
document.addEventListener('DOMContentLoaded', () => {
  const promptText = document.getElementById('heroPromptText');
  const nameText = document.getElementById('heroNameText');
  const cursor1 = document.getElementById('cursor1');
  const cursor2 = document.getElementById('cursor2');
  const rolesContainer = document.getElementById('heroRoles');

  if (!promptText || !nameText || !rolesContainer) return; // not on this page

  typeInto(promptText, 'whoami', prefersReducedMotion ? 0 : 95, () => {
    setTimeout(() => {
      if (cursor1) cursor1.style.display = 'none';
      if (cursor2) cursor2.style.display = 'inline-block';
      typeInto(nameText, 'Ethan Tran', prefersReducedMotion ? 0 : 75, () => {
        // .role-divider reveals in the same staggered sequence as the
        // role flags (matches its DOM position, right after the Recent
        // Graduate badge) — but only ever gets a .revealed class, never
        // textContent, since setting that would wipe out its <hr> child.
        const flags = rolesContainer.querySelectorAll('.role-flag, .role-divider');
        let idx = 0;
        function revealNext() {
          if (idx < flags.length) {
            const flag = flags[idx];
            if (flag.classList.contains('role-flag')) {
              flag.textContent = flag.getAttribute('data-text');
            }
            flag.classList.add('revealed');
            idx++;
            setTimeout(revealNext, prefersReducedMotion ? 0 : 200);
          }
        }
        setTimeout(revealNext, prefersReducedMotion ? 0 : 250);
      });
    }, prefersReducedMotion ? 0 : 350);
  });
});

// Generic "type on load" for simple prompt lines that don't need the
// multi-stage hero sequence — any element with data-type-text just types
// itself in once the page loads.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-type-text]').forEach((el) => {
    const text = el.getAttribute('data-type-text');
    typeInto(el, text, prefersReducedMotion ? 0 : 45);
  });
});

// Section headers type themselves in once scrolled into view, then stop
// observing — no re-triggering on scroll back up. Types the plain text,
// then snaps back to the original styled HTML (with the colored command
// prefix) once done, so there's no risk of corrupting markup mid-type.
// Once typing finishes, the section's .section-content (cards, lists,
// etc.) fades/slides into view — mirrors the reveal-on-scroll behavior
// used on the Sushi King site, but gated behind the typing animation
// here instead of a plain viewport check.
document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.sectionHeader h2');
  if (!headers.length) return;

  // No animation support — content was never hidden (see .reveal-ready in
  // styles.css), so there's nothing to do.
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = 'true';
        const finalHTML = entry.target.innerHTML;
        const fullText = entry.target.textContent;
        const content = entry.target.closest('section')?.querySelector('.section-content');
        entry.target.textContent = '';
        typeInto(entry.target, fullText, prefersReducedMotion ? 0 : 28, () => {
          entry.target.innerHTML = finalHTML;
          if (content) content.classList.add('revealed');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  // Only now that the observer exists is it safe to hide content until its
  // header types in — set any earlier and a failure above would leave the
  // page blank.
  document.documentElement.classList.add('reveal-ready');
  headers.forEach((h) => observer.observe(h));
});

// Horizontal mouse-wheel scrolling for the education section's card row.
// A plain mouse only ever fires vertical deltaY on wheel — overflow-x:auto
// alone doesn't translate that into horizontal movement (only Shift+wheel
// or a trackpad's native horizontal swipe do), so a normal mouse wheel
// silently does nothing while hovering the row. This bridges that gap.
// Guarded with a null check since this container only exists on
// index.html and script.js is shared across every page.
document.addEventListener('DOMContentLoaded', () => {
  const sideScrollContainer = document.querySelector('.side-scrolling-container');
  if (!sideScrollContainer) return;

  sideScrollContainer.addEventListener('wheel', (e) => {
    const atLeftEdge = sideScrollContainer.scrollLeft <= 0;
    const atRightEdge =
      Math.ceil(sideScrollContainer.scrollLeft + sideScrollContainer.clientWidth) >=
      sideScrollContainer.scrollWidth;
    // Only take over the scroll if it would actually move the row —
    // otherwise let it fall through to normal page scrolling once either
    // end is reached, instead of trapping the whole page inside the row.
    const scrollingPastLeftEdge = e.deltaY < 0 && atLeftEdge;
    const scrollingPastRightEdge = e.deltaY > 0 && atRightEdge;
    if (scrollingPastLeftEdge || scrollingPastRightEdge) return;

    e.preventDefault();
    sideScrollContainer.scrollLeft += e.deltaY;
  }, { passive: false });
});

// ===== Activity Feed =====
// Merges pre-fetched GitHub activity (built server-side by
// .github/workflows/update-activity.yml + scripts/fetch-activity.js and
// written to activity-cache.json) with hand-written "editorial" entries
// from activity-editorial.json into a bento-style CSS grid — each tile's
// footprint is set by how big its diff is (see tileSizeClass below).
//
// Testing locally: drop a file named activity-cache.json in the project
// root and serve the site from localhost — it's used instead of the live
// branch (see fetchActivityCache). The file is gitignored.
//
// No GitHub API calls happen in the browser — the cache file is a plain
// static fetch, so there's no rate limit exposure for site visitors and
// no loading flicker waiting on a live API round-trip.
//
// To change which repos feed the cache: edit REPOS in
// scripts/fetch-activity.js (not this file).
// To post an editorial update: add a new object to activity-editorial.json
// — { "date": "YYYY-MM-DD", "title": "...", "body": "...", "image": "images/optional.jpg" }
// — then commit/push. "image" is optional; omit it for a plain text note.
document.addEventListener('DOMContentLoaded', () => {
  const feedEl = document.getElementById('activityFeed');
  if (!feedEl) return;

  // No cap on history — everything in the cache is available, revealed a
  // page at a time with "Show more".
  const PAGE_SIZE = 15; // roughly how many tiles each "Show more" adds (rounded up to whole rows)

  let allItems = [];

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

  const timeAgo = (isoDate) => {
    const then = new Date(isoDate).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Octicons (MIT licensed) — GitHub's own icon set, fitting since this
  // content is GitHub-sourced data. git-commit/git-pull-request/tag/
  // issue-opened for the four GitHub event types, pencil for editorial
  // notes. Source: https://github.com/primer/octicons
  const ICONS = {
    push: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path></svg>',
    pr: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg>',
    release: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"></path></svg>',
    issue: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg>',
    note: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"></path></svg>',
  };

  // Tile size = how much code changed (lines added + deleted), shown as
  // width: each tier is a number of width units in a row (see packRows).
  // Tiers are roughly log-scaled because real diffs have a long tail (a
  // handful of 1000-line pushes, lots of 5-line fixes).
  //   size-sm  1 unit   < 25 lines
  //   size-md  2 units  25–199
  //   size-lg  3 units  200–599
  //   size-xl  4 units  600+
  const DIFF_TIERS = [
    [600, 'size-xl'],
    [200, 'size-lg'],
    [25, 'size-md'],
  ];
  const TILE_UNITS = { 'size-sm': 1, 'size-md': 2, 'size-lg': 3, 'size-xl': 4 };

  function diffSize(item) {
    if (item.additions == null) return null;
    return item.additions + (item.deletions || 0);
  }

  function tileSizeClass(item) {
    // Not code changes, so no diff to go on — sized by type instead.
    if (item.source === 'editorial') return item.photo ? 'size-lg' : 'size-md';
    const lines = diffSize(item);
    // No diffstat: GitHub omits it for very large pushes, and real
    // PR/release/issue events don't carry one — releases default big,
    // everything else to the middle tier rather than a guess. A push
    // relabeled as a PR/release by labelByMessage() keeps its diff, so it's
    // still sized by it.
    if (lines == null) return item.tagClass === 'release' ? 'size-lg' : 'size-md';
    for (const [min, sizeClass] of DIFF_TIERS) {
      if (lines >= min) return sizeClass;
    }
    return 'size-sm';
  }

  // For a push, "N commits" is useful info that used to live in the title
  // text ("Pushed N commits — latest: ...") — now that the title is just
  // the commit message itself, this small helper surfaces the count next
  // to the repo name instead, e.g. "aquariumTool · 3 commits".
  function repoLine(item) {
    const repo = escapeHtml(item.repo);
    if (item.commitCount > 1) {
      return `${repo} &middot; ${item.commitCount} commits`;
    }
    return repo;
  }

  // Diffstat for a push, e.g. "+120" or "+120 -8" — deletions are only
  // shown when there actually are any; a push with zero deletions just
  // shows the insertions alone rather than a redundant "-0".
  function diffStatHtml(item) {
    if (item.additions == null || item.deletions == null) return '';
    if (item.additions === 0 && item.deletions === 0) return '';
    const parts = [`<span class="diff-add">+${item.additions}</span>`];
    if (item.deletions > 0) parts.push(`<span class="diff-del">-${item.deletions}</span>`);
    return parts.join(' ');
  }

  // activity-cache.json is written by the daily Action to a SEPARATE
  // branch (activity-data), not main — see scripts/fetch-activity.js and
  // .github/workflows/update-activity.yml. This is deliberate: if the bot
  // committed straight to main, forgetting to `git pull` before starting
  // a local session could collide with a bot commit and produce a merge
  // commit burying your real commit message. Fetching from a raw.
  // githubusercontent.com URL on a dedicated branch means the bot never
  // touches main at all, so there's nothing to collide with.
  // Shape: { generatedAt, events: [...] }
  const ACTIVITY_CACHE_URL = 'https://raw.githubusercontent.com/ETTRAN777/portfolio/activity-data/activity-cache.json';

  // Local testing: on localhost, a local activity-cache.json in the
  // project root wins (it's in .gitignore, so it never gets committed),
  // falling back to the live branch when there isn't one. The published
  // site only ever reads the live branch.
  const LOCAL_ACTIVITY_CACHE = 'activity-cache.json';
  const isLocalDev = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ||
    location.hostname.endsWith('.localhost');

  // Pushes whose commit message marks them as something more specific get
  // that label instead — applied at load, so it covers everything already
  // in the cache and anything backlogged by hand, not just new events.
  // Merge is checked first: "Merge branch 'release/v2'" is still a merge.
  //   starts with "merge"         -> PR       (e.g. "Merge branch 'main' of …")
  //   contains "v" + a number     -> RELEASE  (e.g. "V2.5 Schedule Revamp")
  // "Merge" only counts at the start, which is where git puts it in its own
  // merge commits ("Merge branch …", "Merge pull request …") — anywhere
  // would also catch messages like "…less merge conflicts".
  // Only the tag/icon change; commit count, diffstat and diff-based size
  // carry over unchanged.
  const MESSAGE_LABELS = [
    { test: /^\s*merge\b/i, tagClass: 'pr', tagLabel: 'PR' },
    { test: /\bv\d/i, tagClass: 'release', tagLabel: 'RELEASE' },
  ];

  function labelByMessage(event) {
    if (event.tagClass !== 'push') return event;
    const rule = MESSAGE_LABELS.find(({ test }) => test.test(event.message || ''));
    return rule ? { ...event, tagClass: rule.tagClass, tagLabel: rule.tagLabel } : event;
  }

  async function fetchActivityCache() {
    const sources = isLocalDev ? [LOCAL_ACTIVITY_CACHE, ACTIVITY_CACHE_URL] : [ACTIVITY_CACHE_URL];
    for (const url of sources) {
      try {
        const res = await fetch(url, url === LOCAL_ACTIVITY_CACHE ? { cache: 'no-store' } : undefined);
        if (!res.ok) continue;
        const data = await res.json();
        if (url === LOCAL_ACTIVITY_CACHE) console.info('Activity feed: using local activity-cache.json');
        return (data.events || []).map((event) => labelByMessage({ ...event, source: 'github' }));
      } catch (err) {
        console.warn(`Activity feed: could not load ${url}`, err);
      }
    }
    return [];
  }

  async function fetchEditorialEntries() {
    try {
      const res = await fetch('activity-editorial.json');
      if (!res.ok) return [];
      const raw = await res.json();
      return raw.map((entry) => ({
        source: 'editorial',
        tagClass: 'note',
        tagLabel: 'NOTE',
        repo: 'update',
        message: entry.title,
        extra: entry.body || null,
        photo: entry.image || null,
        url: null,
        date: entry.date,
      }));
    } catch (err) {
      console.warn('Activity feed: could not load editorial entries', err);
      return [];
    }
  }

  // Compact date for the tile corner: "3d ago" while recent, then "Oct 14"
  // (year only when it isn't this year) — narrow tiles can't fit
  // "Oct 14, 2026". The modal still uses the full timeAgo().
  function tileDate(isoDate) {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    if (Date.now() - d.getTime() < 30 * 86400000) return timeAgo(isoDate);
    const opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = '2-digit';
    return d.toLocaleDateString(undefined, opts);
  }

  function tileHtml(item, idx) {
    const sizeClass = tileSizeClass(item);
    const diffStat = diffStatHtml(item);
    // Relative date in the corner, so order is readable tile by tile.
    const date = `<time class="activity-tile-date" datetime="${escapeHtml(item.date)}">${tileDate(item.date)}</time>`;
    if (item.photo) {
      return `
        <button type="button" class="activity-tile ${sizeClass} has-photo tag-${item.tagClass}" style="background-image:url('${item.photo}');" data-idx="${idx}">
          ${date}
          <div class="activity-tile-overlay">
            <div class="activity-tile-title-row">
              <span class="activity-tag tag-${item.tagClass}">${item.tagLabel}</span>
              <span class="activity-tile-title">${escapeHtml(item.message)}</span>
            </div>
            <div class="activity-tile-meta-row">
              <span class="activity-tile-repo">${repoLine(item)}</span>
              ${diffStat ? `<span class="activity-tile-diffstat">${diffStat}</span>` : ''}
            </div>
          </div>
        </button>
      `;
    }
    return `
      <button type="button" class="activity-tile ${sizeClass} tag-${item.tagClass}" data-idx="${idx}">
        ${date}
        <div class="activity-tile-icon">${ICONS[item.tagClass] || ICONS.note}</div>
        <div class="activity-tile-footer">
          <div class="activity-tile-title-row">
            <span class="activity-tag tag-${item.tagClass}">${item.tagLabel}</span>
            <span class="activity-tile-title">${escapeHtml(item.message)}</span>
          </div>
          <div class="activity-tile-meta-row">
            <span class="activity-tile-repo">${repoLine(item)}</span>
            ${diffStat ? `<span class="activity-tile-diffstat">${diffStat}</span>` : ''}
          </div>
        </div>
      </button>

    `;
  }

  // ----- Modal -----
  // Built once and reused — opened/populated per tile click rather than
  // rebuilding the DOM node each time.
  let modalOverlay = null;
  let modalContent = null;
  let modalCliText = null;
  let modalCursor = null;
  let modalTypingGen = 0; // guards against overlapping typing if tiles are clicked in quick succession

  // Derives a plausible CLI command for "opening" this item, using the
  // real id pulled from its GitHub URL where possible — a commit gets
  // `git show <sha>`, a PR gets `gh pr view <number>`, etc. Editorial
  // notes have no such id (they're not GitHub objects), so they fall
  // back to a generic-looking placeholder instead.
  function deriveCliCommand(item) {
    if (item.url) {
      try {
        const parts = new URL(item.url).pathname.split('/').filter(Boolean);
        const kind = parts[2];
        if (kind === 'commit' && parts[3]) return `git show ${parts[3].slice(0, 7)}`;
        if (kind === 'pull' && parts[3]) return `gh pr view ${parts[3]}`;
        if (kind === 'issues' && parts[3]) return `gh issue view ${parts[3]}`;
        if (kind === 'releases' && parts[3] === 'tag' && parts[4]) return `gh release view ${parts[4]}`;
      } catch (_) { /* malformed url — fall through to generic */ }
    }
    const randomId = Math.floor(100000 + Math.random() * 900000);
    return `open commit-${randomId}`;
  }

  function ensureModal() {
    if (modalOverlay) return;
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'activity-modal-overlay';
    modalOverlay.id = 'activityModalOverlay';
    modalOverlay.innerHTML = `
      <div class="activity-modal" role="dialog" aria-modal="true" aria-labelledby="activityModalTitle">
        <button type="button" class="activity-modal-close" id="activityModalClose" aria-label="Close">&times;</button>
        <div class="activity-modal-cli"><span class="cli-prompt">$</span> <span id="activityModalCliText"></span><span class="cursor-blink" id="activityModalCursor"></span></div>
        <div id="activityModalContent" class="activity-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
    modalContent = modalOverlay.querySelector('#activityModalContent');
    modalCliText = modalOverlay.querySelector('#activityModalCliText');
    modalCursor = modalOverlay.querySelector('#activityModalCursor');

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    modalOverlay.querySelector('#activityModalClose').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
    });
  }

  // Splits an extra/body text block into separate messages on blank-line
  // boundaries — matches how multiple `-m` commit messages are joined
  // ("Title\n\nBody 1\n\nBody 2") and how most PR/issue/release markdown
  // bodies are paragraph-separated.
  function splitMessages(text) {
    return text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }

  // Renders multiple messages as a proper CLI tree (same box-drawing
  // convention as the `tree` command, npm ls, cargo tree, etc):
  //   ├─ Message
  //   ├─ Message 2
  //   └─ Message 3
  // Single-message extras skip this entirely and render as plain prose —
  // the tree is only worth it when there's actually more than one item.
  // Renders multiple messages as a connected tree, CSS-drawn rather than
  // built from font glyphs — Unicode box-drawing characters (├─/└─) don't
  // reliably touch edge-to-edge once there's any line-height between
  // rows, so the "connection" is a real vertical line via ::before/::after
  // instead, the same technique VS Code's file explorer and GitHub's file
  // tree use. Single-message extras skip this and render as plain prose.
  function buildTreeHtml(messages) {
    const items = messages.map((msg) => `<div class="tree-item">${escapeHtml(msg)}</div>`);
    return `<div class="activity-patch-tree">${items.join('')}</div>`;
  }

  function extraHtml(item) {
    if (!item.extra) return '';
    const label = item.extraLabel ? `<div class="activity-modal-extra-label">${escapeHtml(item.extraLabel)}</div>` : '';
    const messages = splitMessages(item.extra);
    const body = messages.length > 1 ? buildTreeHtml(messages) : `<p>${escapeHtml(item.extra)}</p>`;
    return label + body;
  }

  function openModal(item) {
    ensureModal();
    const command = deriveCliCommand(item);
    const contentHtml = `
      ${item.photo ? `<img class="activity-modal-photo" src="${item.photo}" alt="">` : ''}
      <span class="activity-tag tag-${item.tagClass}">${item.tagLabel}</span>
      <h3 id="activityModalTitle">${escapeHtml(item.message)}</h3>
      ${extraHtml(item)}
      <div class="activity-meta">${repoLine(item)} &middot; ${timeAgo(item.date)}${diffStatHtml(item) ? ` &middot; ${diffStatHtml(item)}` : ''}</div>
      ${item.url ? `<a class="activity-modal-link" href="${item.url}" target="_blank" rel="noopener">View on GitHub &#8599;</a>` : ''}
    `;

    modalContent.innerHTML = contentHtml;
    modalContent.classList.add('revealed');
    modalCliText.textContent = '';
    modalCursor.style.display = '';
    modalOverlay.classList.add('open');
    modalOverlay.querySelector('#activityModalClose').focus();

    // Types the derived command at the "$" prompt purely as CLI flavor —
    // content above is already visible immediately, this never gates it.
    // modalTypingGen guards against garbled overlap if a second tile is
    // clicked before the first command finishes typing.
    const gen = ++modalTypingGen;
    const speed = prefersReducedMotion ? 0 : 28;
    let i = 0;
    (function step() {
      if (gen !== modalTypingGen) return;
      if (i <= command.length) {
        modalCliText.textContent = command.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        modalCursor.style.display = 'none';
      }
    })();
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
  }

  // ----- Layout: justified rows, newest first -----
  // Tiles stay in strict date order, left to right then top to bottom, and
  // are packed into rows like a justified photo gallery: each tile's width
  // is proportional to its units, and every row is stretched to span the
  // full width, so there are no holes and no right-edge raggedness.
  //
  // How many units fit per row depends on the feed's width (one unit is at
  // least MIN_UNIT_PX wide). Order is fixed, so the only choice is where
  // rows break. A row whose units don't add up to exactly the capacity has
  // its tiles stretched or squeezed to fit; the breaks are chosen for the
  // whole list at once (like justified text) to keep that distortion as
  // small as possible overall, with squeezing capped so tiers never visually
  // overlap (on real data this keeps every tile within ~0.86–1.2× its true
  // size). The very last row isn't stretched, so a lone small tile at the
  // end stays small.
  const MIN_UNIT_PX = 150;
  const MAX_SQUEEZE = 1.2;
  const MAX_ROW_ITEMS = 12;

  function rowCapacity() {
    return Math.max(2, Math.floor(feedEl.clientWidth / MIN_UNIT_PX));
  }

  function packRows(units, capacity) {
    const w = units.map((u) => Math.min(u, capacity));
    const n = w.length;
    // best[i] = lowest total distortion for laying out the first i tiles;
    // from[i] = where the last row of that layout starts.
    const best = new Array(n + 1).fill(Infinity);
    const from = new Array(n + 1).fill(0);
    best[0] = 0;
    for (let end = 1; end <= n; end++) {
      let sum = 0;
      for (let start = end - 1; start >= 0 && end - start <= MAX_ROW_ITEMS; start--) {
        sum += w[start];
        const scale = sum / capacity; // >1 squeezed, <1 stretched
        if (scale > MAX_SQUEEZE && end - start > 1) break; // only gets worse going further back
        const isLast = end === n;
        // Squared log error: stretching ×1.5 costs the same as squeezing ×1/1.5.
        const cost = isLast && scale <= 1 ? 0 : Math.log(scale) ** 2;
        if (best[start] + cost < best[end]) {
          best[end] = best[start] + cost;
          from[end] = start;
        }
      }
    }
    const rows = [];
    for (let end = n; end > 0; end = from[end]) {
      const start = from[end];
      const items = [];
      let sum = 0;
      for (let i = start; i < end; i++) {
        items.push({ i, w: w[i] });
        sum += w[i];
      }
      rows.unshift({ items, units: sum });
    }
    return rows;
  }

  // A w-unit tile spans w units plus the (w-1) gaps between them, so
  // flex-basis carries those gaps and flex-grow splits the rest by units —
  // that keeps "2 units" the same width in every row, whatever else is in it.
  function flexFor(w) {
    return `${w} ${w} calc(${w - 1} * var(--tile-gap))`;
  }

  function renderActivity() {
    if (!allItems.length) {
      feedEl.innerHTML = '<p class="activity-empty">No recent activity to show right now.</p>';
      return;
    }

    // Tiles are built once and moved between rows on re-layout, so their
    // click handlers survive resizes and paging.
    const holder = document.createElement('div');
    holder.innerHTML = allItems.map(tileHtml).join('');
    const tiles = [...holder.querySelectorAll('.activity-tile')];
    tiles.forEach((tile) => {
      tile.addEventListener('click', () => openModal(allItems[Number(tile.dataset.idx)]));
    });
    const units = tiles.map((tile) => TILE_UNITS[[...tile.classList].find((c) => c in TILE_UNITS)] || 1);

    feedEl.parentNode.querySelector('.activity-controls')?.remove();
    const controls = document.createElement('div');
    controls.className = 'activity-controls';
    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'activity-toggle';
    const lessBtn = document.createElement('button');
    lessBtn.type = 'button';
    lessBtn.className = 'activity-toggle';
    lessBtn.textContent = 'Show less';
    controls.append(moreBtn, lessBtn);
    feedEl.insertAdjacentElement('afterend', controls);

    let target = PAGE_SIZE; // tiles wanted on screen; always rounded up to whole rows
    let capacity = 0;
    let rows = [];

    function layout() {
      capacity = rowCapacity();
      rows = packRows(units, capacity);
      feedEl.replaceChildren();
      let shown = 0;
      for (const [r, row] of rows.entries()) {
        if (shown >= target) break;
        const rowEl = document.createElement('div');
        rowEl.className = 'activity-row';
        row.items.forEach(({ i, w }) => {
          tiles[i].style.flex = flexFor(w);
          rowEl.appendChild(tiles[i]);
        });
        const isLastRow = r === rows.length - 1;
        if (isLastRow && row.units < capacity) {
          const spacer = document.createElement('div');
          spacer.className = 'activity-row-spacer';
          spacer.style.flex = flexFor(capacity - row.units);
          rowEl.appendChild(spacer);
        }
        feedEl.appendChild(rowEl);
        shown += row.items.length;
      }
      const remaining = tiles.length - shown;
      moreBtn.hidden = remaining === 0;
      moreBtn.textContent = `Show more (${remaining} older)`;
      lessBtn.hidden = target <= PAGE_SIZE; // only once "Show more" has been used
      controls.hidden = moreBtn.hidden && lessBtn.hidden;
    }

    moreBtn.addEventListener('click', () => {
      target = feedEl.querySelectorAll('.activity-tile').length + PAGE_SIZE;
      layout();
    });
    lessBtn.addEventListener('click', () => {
      target = PAGE_SIZE;
      layout();
      feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Units per row depend on width — re-pack only when that number changes.
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (rowCapacity() !== capacity) layout();
      });
    });

    layout();
  }

  Promise.all([fetchActivityCache(), fetchEditorialEntries()])
    .then(([githubEvents, editorialEntries]) => {
      allItems = [...githubEvents, ...editorialEntries]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      renderActivity();
    })
    .catch((err) => {
      console.warn('Activity feed failed to load', err);
      feedEl.innerHTML = '<p class="activity-empty">Activity feed is unavailable right now.</p>';
    });
});