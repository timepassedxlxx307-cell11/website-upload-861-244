(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    var backToTop = document.querySelector('[data-back-to-top]');

    function onScroll() {
      if (header) {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
      }
      if (backToTop) {
        backToTop.classList.toggle('is-visible', window.scrollY > 500);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var previous = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            showSlide(index + 1);
          }, 5200);
        }
      }

      if (previous) {
        previous.addEventListener('click', function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          restart();
        });
      });

      showSlide(0);
      restart();
    });

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      var searchInput = filterPanel.querySelector('[data-search-input]');
      var filters = Array.prototype.slice.call(filterPanel.querySelectorAll('.js-filter'));
      var countNode = filterPanel.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
      var emptyResult = document.querySelector('[data-empty-result]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      var channel = params.get('category') || params.get('channel') || '';

      if (searchInput && query) {
        searchInput.value = query;
      }

      filters.forEach(function (filter) {
        if (filter.dataset.filter === 'channel' && channel) {
          filter.value = channel;
        }
      });

      function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var values = {};
        var visible = 0;

        filters.forEach(function (filter) {
          values[filter.dataset.filter] = normalize(filter.value);
        });

        cards.forEach(function (card) {
          var ok = true;
          var haystack = normalize(card.dataset.search);

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (values.channel && normalize(card.dataset.channel) !== values.channel) {
            ok = false;
          }
          if (values.type && normalize(card.dataset.type) !== values.type) {
            ok = false;
          }
          if (values.year && normalize(card.dataset.year) !== values.year) {
            ok = false;
          }
          if (values.region && normalize(card.dataset.region) !== values.region) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
        if (emptyResult) {
          emptyResult.classList.toggle('is-visible', visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }
      filters.forEach(function (filter) {
        filter.addEventListener('change', applyFilters);
      });
      applyFilters();
    }
  });
})();


(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    document.querySelectorAll('[data-player-page-play]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var button = document.querySelector('[data-player-toggle]');
        if (button) {
          button.click();
        }
      });
    });
  });
})();
