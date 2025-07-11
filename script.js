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


// Gallery popup modal for .galleryItem
document.addEventListener("DOMContentLoaded", () => {
  // Create modal elements
  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <span class="gallery-modal-close">&times;</span>
      <img src="" alt="Gallery Image" class="gallery-modal-img" />
      <div class="gallery-modal-caption"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector(".gallery-modal-img");
  const modalCaption = modal.querySelector(".gallery-modal-caption");
  const closeBtn = modal.querySelector(".gallery-modal-close");

  // Open modal on galleryItem click
  document.querySelectorAll('.galleryItem').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const fallbackCaption = item.querySelector('p');
    const detailedCaption = img.getAttribute('data-caption');

    modalImg.src = img.src;
    modalImg.alt = img.alt || '';

    modalCaption.textContent = detailedCaption || (fallbackCaption ? fallbackCaption.textContent : '');

    modal.classList.add('open');
    document.body.style.overflow = "hidden";
  });
});

  // Close modal on close button or outside click
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = "";
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = "";
    }
  });
});
