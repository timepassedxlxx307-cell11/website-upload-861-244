(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function qs(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function activateMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function activateSearchForms() {
    qs("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function activateCarousel() {
    qs("[data-carousel]").forEach(function (carousel) {
      var slides = qs(".hero-slide", carousel);
      var dots = qs(".hero-dot", carousel);
      if (!slides.length) {
        return;
      }
      var current = 0;
      var timer;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === current);
        });
      }
      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide") || 0));
          start();
        });
      });
      carousel.addEventListener("mouseenter", function () {
        clearInterval(timer);
      });
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function activateFilters() {
    qs("[data-card-filter]").forEach(function (input) {
      var selector = input.getAttribute("data-target") || ".movie-card";
      var cards = qs(selector);
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
          card.hidden = Boolean(keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function resultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeText(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"card-cover\" href=\"" + escapeText(movie.url) + "\" aria-label=\"观看" + escapeText(movie.title) + "\">" +
      "<img src=\"" + escapeText(movie.cover) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-year\">" + escapeText(movie.year) + "</span>" +
      "<span class=\"card-play\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\">" + escapeText(movie.region) + " · " + escapeText(movie.type) + "</div>" +
      "<h3><a href=\"" + escapeText(movie.url) + "\">" + escapeText(movie.title) + "</a></h3>" +
      "<p>" + escapeText(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function activateSearchPage() {
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    var input = document.getElementById("searchInput");
    if (!results || !status || !input || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = "";
        status.textContent = "输入关键词开始搜索";
        return;
      }
      var words = keyword.split(/\s+/).filter(Boolean);
      var list = window.SEARCH_DATA.filter(function (movie) {
        var text = movie.searchText.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      status.textContent = list.length ? "为你找到相关影片" : "未找到相关影片";
      results.innerHTML = list.map(resultCard).join("");
    }
    input.addEventListener("input", render);
    render();
  }

  function bindSource(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = source;
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var mask = document.getElementById(options.maskId);
    if (!video) {
      return;
    }
    var started = false;
    function start() {
      if (!started) {
        started = true;
        bindSource(video, options.src);
      }
      if (mask) {
        mask.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (mask) {
      mask.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (mask) {
        mask.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    activateMobileMenu();
    activateSearchForms();
    activateCarousel();
    activateFilters();
    activateSearchPage();
  });
})();
