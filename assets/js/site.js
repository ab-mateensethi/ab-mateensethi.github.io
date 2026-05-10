document.body.classList.add("js-ready");

const root = document.documentElement;
const navButton = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const modeMenu = document.querySelector(".mode-menu");
const modeToggle = document.querySelector(".mode-toggle");
const modeOptions = document.querySelector(".mode-options");
const modeButtons = document.querySelectorAll(".mode-option");
const avatarTrigger = document.querySelector("[data-avatar-trigger]");
const avatarModal = document.querySelector("[data-avatar-modal]");
const avatarCloseControls = document.querySelectorAll("[data-avatar-close]");
const galleryTriggers = document.querySelectorAll("[data-gallery-trigger]");
const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryCloseControls = document.querySelectorAll("[data-gallery-close]");
const galleryModalTitle = document.querySelector("[data-gallery-title]");
const galleryCounter = document.querySelector("[data-gallery-counter]");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryVideo = document.querySelector("[data-gallery-video]");
const galleryCaption = document.querySelector("[data-gallery-caption]");
const galleryThumbs = document.querySelector("[data-gallery-thumbs]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");

let activeGalleryItems = [];
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

const setTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  modeButtons.forEach((button) => {
    const isActive = button.dataset.themeValue === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const syncBodyModalState = () => {
  const avatarIsOpen = avatarModal && !avatarModal.hasAttribute("hidden");
  const galleryIsOpen = galleryModal && !galleryModal.hasAttribute("hidden");

  document.body.classList.toggle("modal-open", Boolean(avatarIsOpen || galleryIsOpen));
};

if (!root.getAttribute("data-theme")) {
  setTheme("light");
} else {
  setTheme(root.getAttribute("data-theme"));
}

if (modeToggle && modeOptions) {
  modeToggle.addEventListener("click", () => {
    const isOpen = !modeOptions.hasAttribute("hidden");
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      navButton?.classList.remove("is-active");
      navButton?.setAttribute("aria-expanded", "false");
    }
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
    if (modeOptions && !modeOptions.hasAttribute("hidden")) {
      modeOptions.setAttribute("hidden", "");
      modeToggle?.setAttribute("aria-expanded", "false");
    }
    const isOpen = nav.classList.toggle("is-open");
    navButton.classList.toggle("is-active", isOpen);
    navButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navButton.classList.remove("is-active");
      navButton.setAttribute("aria-expanded", "false");
    });
  });
}

if (header) {
  let lastScrollY = window.scrollY;

  const syncHeaderVisibility = () => {
    const currentScrollY = window.scrollY;
    const navIsOpen = nav && nav.classList.contains("is-open");
    const modeIsOpen = modeOptions && !modeOptions.hasAttribute("hidden");
    const shouldHide = currentScrollY > 140 && currentScrollY > lastScrollY && !navIsOpen && !modeIsOpen;

    header.classList.toggle("is-hidden", shouldHide);
    lastScrollY = currentScrollY;
  };

  window.addEventListener(
    "scroll",
    () => {
      syncHeaderVisibility();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    header.classList.remove("is-hidden");
    lastScrollY = window.scrollY;
  });

  syncHeaderVisibility();
}

if (avatarTrigger && avatarModal) {
  const toggleAvatarModal = (isOpen) => {
    avatarModal.toggleAttribute("hidden", !isOpen);
    syncBodyModalState();
  };

  avatarTrigger.addEventListener("click", () => {
    toggleAvatarModal(true);
  });

  avatarCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      toggleAvatarModal(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !avatarModal.hasAttribute("hidden")) {
      toggleAvatarModal(false);
    }
  });
}

if (galleryModal && galleryImage && galleryVideo && galleryThumbs && galleryModalTitle && galleryCounter && galleryCaption) {
  const detectGalleryItemType = (src) => (/\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image");

  const parseGalleryItems = (trigger) => {
    const images = (trigger.dataset.galleryImages || "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
    const captions = (trigger.dataset.galleryCaptions || "")
      .split("|")
      .map((item) => item.trim());

    return images.map((src, index) => ({
      src,
      type: detectGalleryItemType(src),
      caption: captions[index] || `Preview item ${index + 1}`
    }));
  };

  const syncGalleryControls = () => {
    const hasMultipleImages = activeGalleryItems.length > 1;

    galleryPrev?.toggleAttribute("hidden", !hasMultipleImages);
    galleryNext?.toggleAttribute("hidden", !hasMultipleImages);
    galleryThumbs.toggleAttribute("hidden", !hasMultipleImages);
    galleryCounter.textContent = hasMultipleImages ? `${activeGalleryIndex + 1} / ${activeGalleryItems.length}` : "";
  };

  const getGalleryTitle = () => {
    const hasVideo = activeGalleryItems.some((item) => item.type === "video");

    if (hasVideo) {
      return activeGalleryItems.length > 1 ? "Preview Images and Video" : "Preview Video";
    }

    return activeGalleryItems.length > 1 ? "Preview Images" : "Preview Image";
  };

  const renderGallery = () => {
    const currentItem = activeGalleryItems[activeGalleryIndex];

    if (!currentItem) {
      return;
    }

    galleryModalTitle.textContent = getGalleryTitle();

    if (currentItem.type === "video") {
      galleryImage.setAttribute("hidden", "");
      galleryImage.removeAttribute("src");
      galleryVideo.removeAttribute("hidden");

      if (galleryVideo.src !== currentItem.src) {
        galleryVideo.src = currentItem.src;
      }

      galleryVideo.setAttribute("aria-label", currentItem.caption);
      galleryVideo.load();
    } else {
      galleryVideo.pause();
      galleryVideo.setAttribute("hidden", "");
      galleryVideo.removeAttribute("src");
      galleryVideo.load();
      galleryImage.removeAttribute("hidden");
      galleryImage.src = currentItem.src;
      galleryImage.alt = currentItem.caption;
    }

    galleryCaption.textContent = currentItem.caption;

    galleryThumbs.querySelectorAll(".gallery-thumb").forEach((thumb, index) => {
      const isActive = index === activeGalleryIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-pressed", String(isActive));
    });

    syncGalleryControls();
  };

  const setGalleryIndex = (nextIndex) => {
    if (!activeGalleryItems.length) {
      return;
    }

    const total = activeGalleryItems.length;
    activeGalleryIndex = (nextIndex + total) % total;
    renderGallery();
  };

  const closeGallery = () => {
    galleryVideo.pause();
    galleryModal.setAttribute("hidden", "");
    syncBodyModalState();

    if (lastGalleryTrigger) {
      lastGalleryTrigger.focus();
    }
  };

  const openGallery = (trigger) => {
    const items = parseGalleryItems(trigger);

    if (!items.length) {
      return;
    }

    activeGalleryItems = items;
    activeGalleryIndex = 0;
    lastGalleryTrigger = trigger;
    galleryThumbs.innerHTML = "";

    activeGalleryItems.forEach((item, index) => {
      const thumb = document.createElement("button");

      thumb.type = "button";
      thumb.className = "gallery-thumb";
      thumb.dataset.index = String(index);
      thumb.setAttribute("aria-label", `Show ${item.type === "video" ? "video" : "image"} ${index + 1}`);

      if (item.type === "video") {
        const videoThumb = document.createElement("div");
        const videoPlay = document.createElement("span");
        const videoLabel = document.createElement("span");

        videoThumb.className = "gallery-thumb-video";
        videoPlay.className = "gallery-thumb-play";
        videoLabel.className = "gallery-thumb-video-label";
        videoLabel.textContent = "Video";

        videoThumb.appendChild(videoPlay);
        videoThumb.appendChild(videoLabel);
        thumb.appendChild(videoThumb);
      } else {
        const thumbImage = document.createElement("img");

        thumbImage.src = item.src;
        thumbImage.alt = item.caption;
        thumb.appendChild(thumbImage);
      }

      thumb.addEventListener("click", () => {
        setGalleryIndex(index);
      });

      galleryThumbs.appendChild(thumb);
    });

    renderGallery();
    galleryModal.removeAttribute("hidden");
    syncBodyModalState();
  };

  galleryTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openGallery(trigger);
    });
  });

  galleryCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      closeGallery();
    });
  });

  galleryPrev?.addEventListener("click", () => {
    setGalleryIndex(activeGalleryIndex - 1);
  });

  galleryNext?.addEventListener("click", () => {
    setGalleryIndex(activeGalleryIndex + 1);
  });

  document.addEventListener("keydown", (event) => {
    if (galleryModal.hasAttribute("hidden")) {
      return;
    }

    if (event.key === "Escape") {
      closeGallery();
    }

    if (event.key === "ArrowLeft") {
      setGalleryIndex(activeGalleryIndex - 1);
    }

    if (event.key === "ArrowRight") {
      setGalleryIndex(activeGalleryIndex + 1);
    }
  });
}

const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll("[data-filter]");
const semesterFilterButtons = document.querySelectorAll("[data-semester-filter]");
const filterCards = document.querySelectorAll("[data-filter-card]");
const filterState = document.querySelector("[data-filter-state]");
const semesterFilterState = document.querySelector("[data-semester-filter-state]");
const filterEmpty = document.querySelector("[data-filter-empty]");
const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");

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

if (filterButtons.length && semesterFilterButtons.length && filterCards.length) {
  let selectedFilter = "all";
  let selectedSemester = "all";
  let activeFilterGroup = "smart";

  const updateFilters = () => {
    let visibleCount = 0;
    let selectedLabel = "All";
    let selectedSemesterLabel = "Semester";

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === selectedFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        selectedLabel = button.textContent.trim();
      }
    });

    semesterFilterButtons.forEach((button) => {
      const isActive = button.dataset.semesterFilter === selectedSemester;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        selectedSemesterLabel = button.textContent.trim();
      }
    });

    filterCards.forEach((card) => {
      const filters = (card.dataset.filters || "")
        .split("|")
        .map((filter) => filter.trim())
        .filter(Boolean);
      const semester = (card.dataset.semester || "").trim();

      let isMatch = true;

      if (activeFilterGroup === "smart") {
        isMatch = selectedFilter === "all" || filters.includes(selectedFilter);
      } else if (activeFilterGroup === "semester") {
        isMatch = semester === selectedSemester;
      }

      card.hidden = !isMatch;

      if (isMatch) {
        visibleCount += 1;
      }
    });

    if (filterState) {
      filterState.textContent =
        activeFilterGroup === "smart" && selectedFilter === "all"
          ? "Showing all chapters in chronological order."
          : activeFilterGroup === "smart"
            ? `Showing ${visibleCount} chapter${visibleCount === 1 ? "" : "s"} for ${selectedLabel}.`
            : "Select a topic above to open its chapters.";
    }

    if (semesterFilterState) {
      semesterFilterState.textContent =
        activeFilterGroup === "semester"
          ? `Showing ${visibleCount} chapter${visibleCount === 1 ? "" : "s"} from ${selectedSemesterLabel}.`
          : "Select a semester to open its chapters.";
    }

    if (filterEmpty) {
      filterEmpty.hidden = visibleCount !== 0;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedFilter = button.dataset.filter;
      selectedSemester = "all";
      activeFilterGroup = "smart";
      updateFilters();
    });
  });

  semesterFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSemester = button.dataset.semesterFilter;
      selectedFilter = "all";
      activeFilterGroup = "semester";
      updateFilters();
    });
  });

  updateFilters();
}

if (contactForm) {
  const messageField = contactForm.querySelector('textarea[name="message"]');
  const nameField = contactForm.querySelector('input[name="name"]');
  const emailField = contactForm.querySelector('input[name="email"]');

  const countWords = (value) => {
    const trimmed = value.trim();

    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const syncWordCount = () => {
    const words = countWords(messageField.value);
    const isWithinLimit = words <= 500;

    if (contactStatus && words === 0) {
      contactStatus.textContent = "";
      delete contactStatus.dataset.state;
    } else if (contactStatus && !isWithinLimit) {
      contactStatus.textContent = "Please shorten your message to 500 words or fewer before creating the draft.";
      contactStatus.dataset.state = "limit";
    } else if (contactStatus && contactStatus.dataset.state === "limit") {
      contactStatus.textContent = "";
      delete contactStatus.dataset.state;
    }

    return { words, isWithinLimit };
  };

  messageField.addEventListener("input", () => {
    syncWordCount();
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { isWithinLimit } = syncWordCount();

    if (!isWithinLimit) {
      messageField.focus();
      return;
    }

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

    if (!name || !email || !message) {
      if (contactStatus) {
        contactStatus.textContent = "Please complete all fields before creating the draft.";
        contactStatus.dataset.state = "required";
      }
      return;
    }

    const subject = `Inquiry from ${name} via Abdul Mateen Chronicles`;
    const body = [`Name: ${name}`, `Email: ${email}`, "", "Message:", message].join("\n");

    if (contactStatus) {
      contactStatus.textContent = "Opening your email draft for review.";
      contactStatus.dataset.state = "ready";
    }

    window.location.href = `mailto:abmateensethi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  [nameField, emailField].forEach((field) => {
    field.addEventListener("input", () => {
      if (contactStatus && contactStatus.dataset.state === "required") {
        contactStatus.textContent = "";
        delete contactStatus.dataset.state;
      }
    });
  });

  syncWordCount();
}
