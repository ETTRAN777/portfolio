// Skill + contact registry. Load BEFORE script.js, at the end of <body>.
//
// Skills: every tag pill on the site comes from the Skill enum below. In the
// HTML, write `<ul class="skills-list" data-skills="JAVA C_SHARP UNITY"></ul>`
// (space-separated Skill keys) and renderSkillLists() fills it in, so a label
// or category only ever changes in one place.
//
// Contact: emails are stored reversed + base64 and only decoded in the
// browser, so they never appear as plain text in the HTML that simple
// scrapers / email harvesters pull down.

const SkillCategory = Object.freeze({
  SOFTWARE: "software-language",
  WEB: "web-language",
  DATABASE: "database",
  INFO_SCI: "info-sci",
});

const skill = (label, category) => Object.freeze({ label, category });

const Skill = Object.freeze({
  // Software / languages
  JAVA: skill("Java", SkillCategory.SOFTWARE),
  SPRING: skill("Spring Boot", SkillCategory.SOFTWARE),
  C_SHARP: skill("C#", SkillCategory.SOFTWARE),
  UNITY: skill("Unity", SkillCategory.SOFTWARE),
  C: skill("C", SkillCategory.SOFTWARE),
  PYTHON: skill("Python", SkillCategory.SOFTWARE),
  X86_ASSEMBLY: skill("x86 Assembly", SkillCategory.SOFTWARE),
  SCHEDULED_JOBS: skill("Scheduled Jobs", SkillCategory.SOFTWARE),
  GIT: skill("Git", SkillCategory.SOFTWARE),
  GITHUB_ACTIONS: skill("GitHub Actions CI/CD", SkillCategory.SOFTWARE),

  // Databases
  SQL: skill("SQL", SkillCategory.DATABASE),
  COSMOS_DB: skill("Cosmos DB", SkillCategory.DATABASE),
  MONGODB: skill("MongoDB", SkillCategory.DATABASE),
  DATA_MIGRATIONS: skill("Data Migrations", SkillCategory.DATABASE),

  // Web / cloud
  HTML: skill("HTML", SkillCategory.WEB),
  CSS: skill("CSS", SkillCategory.WEB),
  JAVASCRIPT: skill("JavaScript", SkillCategory.WEB),
  TYPESCRIPT: skill("TypeScript", SkillCategory.WEB),
  REACT: skill("React", SkillCategory.WEB),
  REDUX: skill("Redux", SkillCategory.WEB),
  FORMIK: skill("Formik", SkillCategory.WEB),
  MATERIAL_UI: skill("Material UI", SkillCategory.WEB),
  NODEJS: skill("Node.js", SkillCategory.WEB),
  EXPRESSJS: skill("Express", SkillCategory.WEB),
  TAILWIND_CSS: skill("Tailwind CSS", SkillCategory.WEB),
  RECHARTS: skill("Recharts", SkillCategory.WEB),
  AZURE_FUNCTIONS: skill("Azure Functions", SkillCategory.WEB),
  CLOUD_COMPUTING: skill("Cloud Computing", SkillCategory.WEB),
  REST_API: skill("REST APIs", SkillCategory.WEB),
  MICROSERVICES: skill("Microservices", SkillCategory.WEB),
  RBAC: skill("Role-Based Access Control", SkillCategory.WEB),

  // Information science / process
  R: skill("R", SkillCategory.INFO_SCI),
  USER_RESEARCH: skill("User Research", SkillCategory.INFO_SCI),
  USER_TESTING: skill("User Testing", SkillCategory.INFO_SCI),
  DATA_ANALYSIS: skill("Data Analysis", SkillCategory.INFO_SCI),
  ACCESSIBILITY: skill("Accessibility (WCAG 2.1)", SkillCategory.INFO_SCI),
  JIRA: skill("Jira", SkillCategory.INFO_SCI),
  AGILE: skill("Agile/Scrum", SkillCategory.INFO_SCI),
  CYBERSECURITY: skill("Cybersecurity", SkillCategory.INFO_SCI),
  NETWORKING: skill("Networking", SkillCategory.INFO_SCI),
});

function renderSkillLists(root = document) {
  root.querySelectorAll("ul.skills-list[data-skills]").forEach((list) => {
    const frag = document.createDocumentFragment();
    for (const key of list.dataset.skills.trim().split(/\s+/)) {
      const s = Skill[key];
      if (!s) {
        console.warn(`Unknown skill key "${key}" in`, list);
        continue;
      }
      const li = document.createElement("li");
      li.className = s.category;
      li.textContent = s.label;
      frag.appendChild(li);
    }
    list.replaceChildren(frag);
  });
}

// Reversed + base64. Encode a new one in a browser console with:
//   btoa("you@example.com".split("").reverse().join(""))
const Email = Object.freeze({
  PERSONAL: "bW9jLmxpYW1nQHhvYm10ZQ==",
  UNIVERSITY: "dWRlLmRtdS5saWFtcHJldEA0MjFuYXJ0ZQ==",
});

const decodeEmail = (encoded) => atob(encoded).split("").reverse().join("");

// <p data-email="PERSONAL"></p>      -> fills in the address as text
// <a data-email-href="PERSONAL">     -> gets a mailto: href
function renderEmails(root = document) {
  root.querySelectorAll("[data-email]").forEach((el) => {
    const encoded = Email[el.dataset.email];
    if (encoded) el.textContent = decodeEmail(encoded);
  });
  root.querySelectorAll("[data-email-href]").forEach((el) => {
    const encoded = Email[el.dataset.emailHref];
    if (encoded) el.href = "mailto:" + decodeEmail(encoded);
  });
}

// Scripts sit at the end of <body>, so the DOM is already parsed — render
// immediately to avoid a flash of empty skill lists.
renderSkillLists();
renderEmails();
