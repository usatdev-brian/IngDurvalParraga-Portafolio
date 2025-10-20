function setCurrentYear() {
  const yearElement = document.querySelector("#current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initSidebar() {
  const sidebar = document.querySelector(".site-sidebar");
  if (!sidebar) return;

  const toggle = sidebar.querySelector(".site-sidebar__toggle");
  const nav = sidebar.querySelector(".site-sidebar__nav");
  if (!toggle || !nav) return;

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const willOpen = !sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  sidebar.querySelectorAll(".site-sidebar__link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 959px)").matches) {
        closeSidebar();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 959px)").matches) {
      sidebar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initScrollSpy() {
  const sections = Array.from(
    document.querySelectorAll(".site-content .section[id]")
  );
  if (!sections.length) return;

  const headerLinks = Array.from(
    document.querySelectorAll(".site-header__nav .site-header__link")
  );
  const sidebarLinks = Array.from(
    document.querySelectorAll(".site-sidebar__link")
  );

  const activateLink = (id) => {
    const target = `#${id}`;
    [...headerLinks, ...sidebarLinks].forEach((link) => {
      const matches = link.getAttribute("href") === target;
      link.classList.toggle("is-active", matches);
      if (matches) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function normalizeText(value) {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function initFilters() {
  document
    .querySelectorAll("[data-filter-group]")
    .forEach((filterContainer) => {
      const group = filterContainer.dataset.filterGroup;
      const lists = Array.from(
        document.querySelectorAll(`[data-list="${group}"]`)
      );

      if (!lists.length) return;

      const items = lists.flatMap((list) => Array.from(list.children));
      const searchInput = filterContainer.querySelector("input[type=\"search\"]");
      const buttons = Array.from(
        filterContainer.querySelectorAll(".filter-button")
      );

      let activeFilter = "all";

      const applyFilters = () => {
        const query = searchInput ? normalizeText(searchInput.value.trim()) : "";

        items.forEach((item) => {
          const category = item.dataset.category || "all";
          const keywords = normalizeText(
            item.dataset.keywords || item.textContent || ""
          );

          const matchesCategory =
            activeFilter === "all" || category.split(" ").includes(activeFilter);
          const matchesQuery = !query || keywords.includes(query);

          item.hidden = !(matchesCategory && matchesQuery);
        });
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          activeFilter = button.dataset.filter || "all";
          buttons.forEach((btn) =>
            btn.classList.toggle("is-active", btn === button)
          );
          applyFilters();
        });
      });

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      applyFilters();

      filterContainer.addEventListener("filters:apply", applyFilters);
    });
}

function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabsElement) => {
    const controls = Array.from(tabsElement.querySelectorAll(".tabs__button"));
    const panels = Array.from(tabsElement.querySelectorAll(".tabs__panel"));
    if (!controls.length || !panels.length) return;

    const filterGroup = tabsElement
      .closest("section")
      ?.querySelector("[data-filter-group]");

    const showTab = (targetId) => {
      controls.forEach((control) => {
        const isActive = control.dataset.tab === targetId;
        control.classList.toggle("is-active", isActive);
        control.setAttribute("aria-selected", String(isActive));
        control.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panels.forEach((panel) => {
        const isTarget = panel.id === `tab-${targetId}`;
        panel.hidden = !isTarget;
        panel.classList.toggle("is-active", isTarget);
      });

      if (filterGroup) {
        filterGroup.dispatchEvent(new CustomEvent("filters:apply"));
      }
    };

    controls.forEach((control) => {
      control.addEventListener("click", () => {
        showTab(control.dataset.tab);
      });
    });
  });
}

function initCollapsibles() {
  document.querySelectorAll('.collapsible').forEach((block) => {
    const summary = block.querySelector('.collapsible__summary');
    const content = block.querySelector('.collapsible__content');
    const toggleText = summary ? summary.querySelector('.collapsible__toggle') : null;
    if (!summary || !content) return;

    // make summary keyboard focusable
    summary.setAttribute('tabindex', '0');

    const updateState = (isOpen) => {
      block.classList.toggle('collapsible--open', isOpen);
      summary.setAttribute('aria-expanded', String(isOpen));
      if (toggleText) toggleText.textContent = isOpen ? 'Ocultar' : 'Mostrar';
    };

    summary.addEventListener('click', () => {
      const isOpen = !block.classList.contains('collapsible--open');
      updateState(isOpen);
    });

    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = !block.classList.contains('collapsible--open');
        updateState(isOpen);
      }
    });
  });
}

function initCarousel() {
  document.querySelectorAll('.carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel__track');
    const prev = carousel.querySelector('.carousel__nav--prev');
    const next = carousel.querySelector('.carousel__nav--next');
    if (!track) return;

    const scrollBy = carousel.dataset.scrollSize
      ? Number(carousel.dataset.scrollSize)
      : track.clientWidth * 0.6;

    if (prev) prev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollBy, behavior: 'smooth' });
    });

    if (next) next.addEventListener('click', () => {
      track.scrollBy({ left: scrollBy, behavior: 'smooth' });
    });

    // nota: se desactiva arrastre por puntero para usar únicamente botones de navegación
  });
}

function initReadMoreLists() {
  document.querySelectorAll('.readmore-list').forEach((list) => {
    const showCount = Number(list.dataset.show || 3);
    const items = Array.from(list.children);
    // if items are fewer or equal than showCount, leave as-is and don't create button
    if (items.length <= showCount) return;

    // hide items beyond showCount
    items.forEach((li, idx) => {
      if (idx >= showCount) li.style.display = 'none';
    });

    // create the button dynamically and insert after the list
    const btn = document.createElement('button');
    btn.className = 'readmore-button';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Leer más';

    const container = document.createElement('div');
    container.className = 'proj-section__actions';
    container.appendChild(btn);

    list.insertAdjacentElement('afterend', container);

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        // collapse
        items.forEach((li, idx) => { if (idx >= showCount) li.style.display = 'none'; });
        btn.textContent = 'Leer más';
        btn.setAttribute('aria-expanded', 'false');
        // optionally scroll to list start
        list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // expand
        items.forEach((li) => { li.style.display = ''; });
        btn.textContent = 'Leer menos';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  initSidebar();
  initScrollSpy();
  initFilters();
  initTabs();
  initCollapsibles();
  initCarousel();
  initReadMoreLists();
});
