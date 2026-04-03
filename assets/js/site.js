document.body.classList.add("js-ready");

const root = document.documentElement;
const navButton = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const modeMenu = document.querySelector(".mode-menu");
const modeToggle = document.querySelector(".mode-toggle");
const modeOptions = document.querySelector(".mode-options");
const modeButtons = document.querySelectorAll(".mode-option");

const setTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  modeButtons.forEach((button) => {
    const isActive = button.dataset.themeValue === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

if (!root.getAttribute("data-theme")) {
  setTheme("light");
} else {
  setTheme(root.getAttribute("data-theme"));
}

if (modeToggle && modeOptions) {
  modeToggle.addEventListener("click", () => {
    const isOpen = !modeOptions.hasAttribute("hidden");
    modeOptions.toggleAttribute("hidden");
    modeToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeValue);
      modeOptions.setAttribute("hidden", "");
      modeToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!modeMenu.contains(event.target)) {
      modeOptions.setAttribute("hidden", "");
      modeToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modeOptions.setAttribute("hidden", "");
      modeToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (navButton && nav) {
  navButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navButton.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
