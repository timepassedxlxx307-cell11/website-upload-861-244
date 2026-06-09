(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var searchToggle = document.querySelector("[data-search-toggle]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var headerSearch = document.querySelector("[data-header-search]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var dropdown = document.querySelector(".nav-dropdown");

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (searchToggle && headerSearch) {
    searchToggle.addEventListener("click", function () {
      headerSearch.classList.toggle("is-open");
      var input = headerSearch.querySelector("input");
      if (headerSearch.classList.contains("is-open") && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  if (dropdown) {
    var trigger = dropdown.querySelector(".dropdown-trigger");
    if (trigger) {
      trigger.addEventListener("click", function () {
        dropdown.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", dropdown.classList.contains("is-open") ? "true" : "false");
      });
    }
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        restart();
      });
    });

    restart();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(query) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var empty = document.querySelector("[data-empty-state]");
    var term = normalize(query);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year")
      ].join(" "));
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0 && cards.length > 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  var localFilters = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));

  localFilters.forEach(function (form) {
    var input = form.querySelector("input[type='search']");
    if (input && initialQuery) {
      input.value = initialQuery;
      filterCards(initialQuery);
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards(input ? input.value : "");
    });
    if (input) {
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    }
  });

  if (!localFilters.length && initialQuery) {
    filterCards(initialQuery);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        window.location.href = "./archive.html";
      }
    });
  });
})();
