(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
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
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterPage = document.querySelector("[data-filter-page]");
        if (filterPage) {
            var cards = Array.prototype.slice.call(filterPage.querySelectorAll("[data-card]"));
            var queryInput = filterPage.querySelector("[data-filter-query]");
            var typeSelect = filterPage.querySelector("[data-filter-type]");
            var regionSelect = filterPage.querySelector("[data-filter-region]");
            var yearSelect = filterPage.querySelector("[data-filter-year]");

            if (queryInput && filterPage.hasAttribute("data-search-page")) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    queryInput.value = q;
                }
            }

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function applyFilters() {
                var query = normalize(queryInput ? queryInput.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (type && normalize(card.getAttribute("data-type")) !== type) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }

            [queryInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });

    window.initPlayer = function (url) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !overlay || !url) {
            return;
        }

        var hls = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            overlay.classList.add("is-hidden");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            overlay.classList.remove("is-hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        video.addEventListener("error", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
