(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-site-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (input && input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
                }
            });
        });

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dotsWrap = carousel.querySelector('[data-hero-dots]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                if (dotsWrap) {
                    Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                        dot.classList.toggle('is-active', dotIndex === current);
                    });
                }
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

            if (dotsWrap) {
                slides.forEach(function (_, index) {
                    var dot = document.createElement('button');
                    dot.type = 'button';
                    dot.setAttribute('aria-label', '切换到第' + (index + 1) + '屏');
                    dot.addEventListener('click', function () {
                        show(index);
                        start();
                    });
                    dotsWrap.appendChild(dot);
                });
            }

            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var list = panel.parentElement.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
            if (!list) {
                return;
            }
            var input = panel.querySelector('[data-filter-input]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var category = panel.querySelector('[data-filter-category]');
            var items = Array.prototype.slice.call(list.querySelectorAll('.search-item'));
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            var cat = params.get('category');

            if (input && q) {
                input.value = q;
            }
            if (category && cat) {
                category.value = cat;
            }

            function apply() {
                var keyword = input ? normalize(input.value) : '';
                var selectedYear = year ? normalize(year.value) : '';
                var selectedRegion = region ? normalize(region.value) : '';
                var selectedCategory = category ? normalize(category.value) : '';

                items.forEach(function (item) {
                    var haystack = normalize([
                        item.dataset.title,
                        item.dataset.genre,
                        item.dataset.tags,
                        item.dataset.region,
                        item.dataset.category,
                        item.dataset.year
                    ].join(' '));
                    var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var passYear = !selectedYear || normalize(item.dataset.year) === selectedYear;
                    var passRegion = !selectedRegion || normalize(item.dataset.region) === selectedRegion;
                    var passCategory = !selectedCategory || normalize(item.dataset.category) === selectedCategory;
                    item.classList.toggle('is-filtered-out', !(passKeyword && passYear && passRegion && passCategory));
                });
            }

            [input, year, region, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    });
}());
