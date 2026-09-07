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
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNavContainer');
const overlay = document.getElementById('overlay');

// Function to toggle menu
function toggleMobileMenu() {
    const isOpen = mobileNav.classList.contains('open');
    
    if (isOpen) {
        // Close Menu
        mobileNav.classList.remove('open');
        overlay.classList.remove('show');
        navToggle.classList.remove('animate-x'); // Rotate back
        setTimeout(() => {
            navToggle.classList.remove('open'); // Separate bars
        }, 200);
    } else {
        // Open Menu
        mobileNav.classList.add('open');
        overlay.classList.add('show');
        navToggle.classList.add('open'); // Bring bars together
        setTimeout(() => {
            navToggle.classList.add('animate-x'); // Rotate to X
        }, 200);
    }
}

// Function to handle link clicks (scroll + close menu)
function handleMobileClick(sectionId) {
    scrollToSection(sectionId); // Uses your existing scroll function
    toggleMobileMenu(); // Close the menu
}

// Event Listeners
// Guarded — #navToggle/#overlay only exist on index.html. Without this
// check, getElementById returns null on every other page (gallery.html,
// debtAndTaxes.html, volare.html), and calling .addEventListener on null
// throws synchronously — which was halting the rest of this script,
// including the gallery modal setup below, on every page that actually
// has a gallery.
if (navToggle && overlay) {
  navToggle.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', toggleMobileMenu);
}

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

  if (!('IntersectionObserver' in window)) {
    // No animation support — just make sure content isn't stuck at
    // opacity: 0 forever.
    document.querySelectorAll('.section-content').forEach((c) => c.classList.add('revealed'));
    return;
  }

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
// from activity-editorial.json, sorted newest-first, into #activityFeed.
//
// No GitHub API calls happen in the browser — the cache file is a plain
// static fetch, so there's no rate limit exposure for site visitors and
// no loading flicker waiting on a live API round-trip.
//
// To change which repos feed the cache: edit REPOS in
// scripts/fetch-activity.js (not this file).
// To post an editorial update: add a new object to activity-editorial.json
// — { "date": "YYYY-MM-DD", "title": "...", "body": "..." } — then
// commit/push. No code changes needed for that.
document.addEventListener('DOMContentLoaded', () => {
  const feedEl = document.getElementById('activityFeed');
  if (!feedEl) return;

  const MAX_ITEMS = 10;

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

  // activity-cache.json is written by the daily Action — see
  // scripts/fetch-activity.js for the shape: { generatedAt, events: [...] }
  async function fetchActivityCache() {
    try {
      const res = await fetch('activity-cache.json');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.events || []).map((event) => ({ ...event, source: 'github' }));
    } catch (err) {
      console.warn('Activity feed: could not load activity-cache.json', err);
      return [];
    }
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
        url: null,
        date: entry.date,
      }));
    } catch (err) {
      console.warn('Activity feed: could not load editorial entries', err);
      return [];
    }
  }

  // All message/repo/extra text arrives as raw plain text from both
  // sources above — escaping happens exactly once, here, at render time.
  function renderActivity(items) {
    if (!items.length) {
      feedEl.innerHTML = '<p class="activity-empty">No recent activity to show right now.</p>';
      return;
    }

    feedEl.innerHTML = items.map((item) => `
      <div class="activity-item">
        <span class="activity-tag tag-${item.tagClass}">${item.tagLabel}</span>
        <div class="activity-body">
          <div class="activity-repo">${escapeHtml(item.repo)}</div>
          <div class="activity-message">${escapeHtml(item.message)}${item.url ? ` <a href="${item.url}" target="_blank" rel="noopener">&#8599;</a>` : ''}</div>
          ${item.extra ? `<div class="activity-message" style="opacity:0.85; margin-top:0.25rem;">${escapeHtml(item.extra)}</div>` : ''}
          <div class="activity-meta">${timeAgo(item.date)}</div>
        </div>
      </div>
    `).join('');
  }

  Promise.all([fetchActivityCache(), fetchEditorialEntries()])
    .then(([githubEvents, editorialEntries]) => {
      const merged = [...githubEvents, ...editorialEntries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, MAX_ITEMS);
      renderActivity(merged);
    })
    .catch((err) => {
      console.warn('Activity feed failed to load', err);
      feedEl.innerHTML = '<p class="activity-empty">Activity feed is unavailable right now.</p>';
    });
});