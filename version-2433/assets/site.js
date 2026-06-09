(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
    filterInput.addEventListener("input", function () {
      var keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.dataset.title || "") + " " + (card.dataset.tags || "")).toLowerCase();
        card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"./" + escapeHtml(movie.url) + "\">" +
      "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-card-title\" href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p class=\"movie-card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>" +
      "<p class=\"movie-card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  var results = document.getElementById("search-results");

  if (results && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-page-input");
    var title = document.getElementById("search-title");
    var copy = document.getElementById("search-copy");

    if (input) {
      input.value = query;
    }

    var pool = window.SEARCH_MOVIES;
    var matched = query ? pool.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
      return haystack.indexOf(query.toLowerCase()) !== -1;
    }) : pool.slice(0, 48);

    if (title) {
      title.textContent = query ? "搜索结果" : "热门推荐";
    }

    if (copy) {
      copy.textContent = query ? "以下内容与你输入的关键词相关。" : "精选热门内容，点击即可进入详情页。";
    }

    results.innerHTML = matched.slice(0, 240).map(cardTemplate).join("") || "<div class=\"content-card\"><h2>暂无匹配内容</h2><p>可以换一个关键词继续搜索。</p></div>";
  }
}());

var StaticMoviePlayer = (function () {
  function init(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attachSource() {
      if (video.dataset.ready === "1") {
        hideOverlay();
        video.play().catch(function () {});
        return;
      }

      video.dataset.ready = "1";

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      hideOverlay();
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attachSource);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        attachSource();
      }
    });

    video.addEventListener("play", hideOverlay);
  }

  return {
    init: init
  };
}());
