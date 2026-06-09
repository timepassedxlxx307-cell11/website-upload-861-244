document.addEventListener("DOMContentLoaded", function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var searchButton = document.querySelector("[data-search-toggle]");
  var searchPanel = document.querySelector("[data-search-panel]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }

  if (searchButton && searchPanel) {
    searchButton.addEventListener("click", function() {
      searchPanel.hidden = !searchPanel.hidden;
      var input = searchPanel.querySelector("input");
      if (!searchPanel.hidden && input) {
        input.focus();
      }
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.location.href = url;
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
    var searchInput = scope.querySelector("[data-live-search]");
    var genreSelect = scope.querySelector("[data-genre-filter]");
    var yearSelect = scope.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector("[data-empty]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function apply() {
      var q = normalize(searchInput ? searchInput.value.trim() : "");
      var genre = normalize(genreSelect ? genreSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var any = false;

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          any = true;
        }
      });

      if (empty) {
        empty.hidden = any;
      }
    }

    [searchInput, genreSelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
});
