// Reusable page pieces, shared by every page — the vanilla equivalent of a
// React component. Load FIRST, before skills.js and script.js:
//
//   <site-footer></site-footer>
//   <script src="components.js"></script>
//   <script src="skills.js"></script>
//   <script src="script.js"></script>
//
// <site-footer> swaps itself out for the contact section + footer, so the
// final DOM (and styles.css) is exactly what hand-written markup would be.
// Email addresses are filled in afterwards by renderEmails() in skills.js.

const Icon = Object.freeze({
  GITHUB: `<svg width="18" height="18" viewBox="0 0 19 19" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"/></svg>`,
  LINKEDIN: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  // Octicon mail-16 (MIT) — same icon set the activity feed uses.
  MAIL: `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/></svg>`,
});

const SocialLink = Object.freeze({
  GITHUB: { href: "https://github.com/ETTRAN777", label: "View GitHub profile", icon: Icon.GITHUB },
  LINKEDIN: { href: "https://www.linkedin.com/in/ethan-tran-8127173ab/", label: "View LinkedIn profile", icon: Icon.LINKEDIN },
});

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    const socials = Object.values(SocialLink)
      .map(({ href, label, icon }) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon}</a>`)
      .join("");
    const noscript = `<noscript>[enable JavaScript to view]</noscript>`;

    this.outerHTML = `
      <section id="contact" class="contact-section">
        <div class="sectionHeader">
          <div class="sectionEnd"></div>
          <h2><span class="cmd-prefix">&gt;</span> contact <span class="cmd-flag">--info</span></h2>
          <div class="sectionEnd"></div>
        </div>
        <div class="section-content">
          <div class="contact-cards">
            <div class="contact-card">
              <span class="label personal">PERSONAL</span>
              <p data-email="PERSONAL">${noscript}</p>
            </div>
            <div class="contact-card">
              <span class="label university">UNIVERSITY</span>
              <p data-email="UNIVERSITY">${noscript}</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="site-footer">
        <p>Copyright © ${year} | Built and designed by Ethan Tran | All Rights Reserved</p>
        <div class="social-icons">
          ${socials}
          <a href="#contact" data-email-href="PERSONAL" aria-label="Send me an email" title="Send me an email">${Icon.MAIL}</a>
        </div>
      </footer>`;
  }
}

customElements.define("site-footer", SiteFooter);

// Repo links on project cards: write just the link, the icon is filled in
// here so the GitHub SVG lives in one place.
//   <a class="card-github" href="https://github.com/owner/repo" ...></a>
document.querySelectorAll("a.card-github").forEach((link) => {
  if (!link.innerHTML.trim()) link.innerHTML = Icon.GITHUB;
});
