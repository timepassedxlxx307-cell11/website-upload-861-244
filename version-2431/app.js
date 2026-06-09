(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var navBar = document.querySelector(".nav-bar");
    var toggle = document.querySelector(".nav-toggle");
    if (!navBar || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      navBar.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
    if (!grids.length) {
      return;
    }
    var input = document.querySelector("[data-filter-search]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var empty = document.getElementById("filter-empty");
    var activeValue = "all";

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var text = cardText(card);
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchType = activeValue === "all" || text.indexOf(activeValue.toLowerCase()) !== -1;
          var show = matchQuery && matchType;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeValue = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    if (input) {
      var urlQuery = new URLSearchParams(window.location.search).get("q");
      if (urlQuery) {
        input.value = urlQuery;
      }
      input.addEventListener("input", apply);
    }

    apply();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    function play() {
      overlay.classList.add("is-hidden");
      load();
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
