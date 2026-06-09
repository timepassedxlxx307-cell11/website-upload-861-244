(() => {
    const header = document.querySelector('[data-site-header]');
    const mobileButton = document.querySelector('[data-mobile-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const backToTop = document.querySelector('[data-back-to-top]');

    const updateHeader = () => {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 12);
        }

        if (backToTop) {
            backToTop.classList.toggle('is-visible', window.scrollY > 520);
        }
    };

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', () => {
            const nextState = !mobileNav.classList.contains('is-open');
            mobileNav.classList.toggle('is-open', nextState);
            mobileButton.setAttribute('aria-expanded', String(nextState));
        });
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('[data-site-search]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[type="search"], input[type="text"]');
            const query = input ? input.value.trim() : '';
            const target = form.getAttribute('data-search-target') || 'search.html';
            const prefix = form.getAttribute('data-prefix') || '';
            const url = new URL(prefix + target, window.location.href);

            if (query) {
                url.searchParams.set('q', query);
            }

            window.location.href = url.href;
        });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;
    let heroTimer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    };

    const startHeroTimer = () => {
        if (!slides.length) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(() => showSlide(activeSlide + 1), 6500);
    };

    document.querySelectorAll('[data-hero-prev]').forEach((button) => {
        button.addEventListener('click', () => {
            showSlide(activeSlide - 1);
            startHeroTimer();
        });
    });

    document.querySelectorAll('[data-hero-next]').forEach((button) => {
        button.addEventListener('click', () => {
            showSlide(activeSlide + 1);
            startHeroTimer();
        });
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    const listFilters = Array.from(document.querySelectorAll('[data-filter-list]'));
    listFilters.forEach((filterRoot) => {
        const searchInput = filterRoot.querySelector('[data-filter-query]');
        const yearSelect = filterRoot.querySelector('[data-filter-year]');
        const typeSelect = filterRoot.querySelector('[data-filter-type]');
        const items = Array.from(filterRoot.querySelectorAll('[data-filter-item]'));
        const counter = filterRoot.querySelector('[data-filter-count]');
        const emptyState = filterRoot.querySelector('[data-empty-state]');

        const runFilter = () => {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';
            let visibleCount = 0;

            items.forEach((item) => {
                const haystack = (item.getAttribute('data-search') || '').toLowerCase();
                const itemYear = item.getAttribute('data-year') || '';
                const itemType = item.getAttribute('data-type') || '';
                const matched = (!query || haystack.includes(query)) && (!year || year === itemYear) && (!type || type === itemType);

                item.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (counter) {
                counter.textContent = String(visibleCount);
            }

            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        };

        [searchInput, yearSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        runFilter();
    });

    const loadHls = (video, source, status) => {
        if (!source) {
            if (status) {
                status.textContent = '未找到可用播放源。';
            }
            return Promise.reject(new Error('Missing HLS source'));
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return Promise.resolve();
        }

        if (status) {
            status.textContent = '当前浏览器暂不支持 HLS 播放，请更换浏览器或安装支持组件。';
        }
        return Promise.reject(new Error('HLS is not supported'));
    };

    document.querySelectorAll('[data-video-player]').forEach((player) => {
        const video = player.querySelector('video');
        const overlay = player.querySelector('[data-play-overlay]');
        const status = player.querySelector('[data-player-status]');

        if (!video) {
            return;
        }

        const source = video.getAttribute('data-source') || '';
        let isLoaded = false;

        const play = () => {
            const ready = isLoaded ? Promise.resolve() : loadHls(video, source, status);
            isLoaded = true;

            ready.then(() => {
                if (status) {
                    status.textContent = '正在加载播放源，请稍候…';
                }
                return video.play();
            }).then(() => {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                if (status) {
                    status.textContent = '播放中：已绑定 HLS/m3u8 播放源。';
                }
            }).catch(() => {
                if (status && status.textContent.includes('正在加载')) {
                    status.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
                }
            });
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('play', () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', () => {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });

        video.addEventListener('error', () => {
            if (status) {
                status.textContent = '播放源加载失败，请稍后重试或切换网络。';
            }
        });
    });

    const searchApp = document.querySelector('[data-search-app]');
    if (searchApp) {
        const prefix = searchApp.getAttribute('data-prefix') || '';
        const queryInput = searchApp.querySelector('[data-search-query]');
        const categorySelect = searchApp.querySelector('[data-search-category]');
        const regionSelect = searchApp.querySelector('[data-search-region]');
        const sortSelect = searchApp.querySelector('[data-search-sort]');
        const resultCount = searchApp.querySelector('[data-search-count]');
        const resultGrid = searchApp.querySelector('[data-search-results]');
        const emptyState = searchApp.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        let movies = [];

        if (queryInput) {
            queryInput.value = initialQuery;
        }

        const createOption = (value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value || '全部';
            return option;
        };

        const normalize = (value) => String(value || '').toLowerCase();

        const escapeHtml = (value) => String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        const renderCard = (movie, rank) => {
            const link = document.createElement('a');
            link.className = 'movie-card';
            link.href = `${prefix}video/${encodeURIComponent(movie.id)}.html`;
            link.setAttribute('aria-label', `${movie.title} 在线观看`);

            const safeTitle = escapeHtml(movie.title);
            const safeCover = escapeHtml(`${prefix}${movie.cover}`);
            const safeDuration = escapeHtml(movie.duration);
            const safeLine = escapeHtml(movie.one_line);
            const safeCategory = escapeHtml(movie.category_name);
            const safeRegion = escapeHtml(movie.region);
            const safeYear = escapeHtml(movie.year);

            link.innerHTML = `
                <div class="movie-cover poster">
                    <img src="${safeCover}" alt="${safeTitle}" loading="lazy">
                    <span class="rank-badge">${rank}</span>
                    <span class="duration-badge">${safeDuration}</span>
                    <span class="play-badge">▶</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${safeTitle}</h3>
                    <p class="card-desc">${safeLine}</p>
                    <div class="card-meta">
                        <span>${safeCategory}</span>
                        <span>${safeRegion}</span>
                        <span>${safeYear}</span>
                    </div>
                </div>
            `;
            return link;
        };

        const applySearch = () => {
            const query = normalize(queryInput ? queryInput.value.trim() : '');
            const category = categorySelect ? categorySelect.value : '';
            const region = regionSelect ? regionSelect.value : '';
            const sort = sortSelect ? sortSelect.value : 'popular';

            let filtered = movies.filter((movie) => {
                const haystack = normalize([
                    movie.title,
                    movie.one_line,
                    movie.summary,
                    movie.review,
                    movie.genre,
                    movie.region,
                    movie.category_name,
                    movie.original_type,
                    ...(movie.tags || [])
                ].join(' '));
                return (!query || haystack.includes(query)) &&
                    (!category || movie.category_name === category) &&
                    (!region || movie.region === region);
            });

            filtered = filtered.sort((a, b) => {
                if (sort === 'latest') {
                    return b.year - a.year || Number(b.id) - Number(a.id);
                }
                if (sort === 'likes') {
                    return b.likes - a.likes;
                }
                return b.views - a.views;
            });

            if (resultCount) {
                resultCount.textContent = String(filtered.length);
            }

            if (emptyState) {
                emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
            }

            if (resultGrid) {
                resultGrid.textContent = '';
                filtered.slice(0, 240).forEach((movie, index) => {
                    resultGrid.appendChild(renderCard(movie, index + 1));
                });
            }
        };

        fetch(`${prefix}data/movies.json`)
            .then((response) => response.json())
            .then((payload) => {
                movies = payload.movies || [];

                const categories = Array.from(new Set(movies.map((movie) => movie.category_name))).sort();
                const regions = Array.from(new Set(movies.map((movie) => movie.region))).sort();

                categories.forEach((category) => categorySelect && categorySelect.appendChild(createOption(category)));
                regions.forEach((region) => regionSelect && regionSelect.appendChild(createOption(region)));

                const categoryFromUrl = params.get('category') || '';
                if (categoryFromUrl && categorySelect) {
                    categorySelect.value = categoryFromUrl;
                }

                [queryInput, categorySelect, regionSelect, sortSelect].forEach((control) => {
                    if (control) {
                        control.addEventListener('input', applySearch);
                        control.addEventListener('change', applySearch);
                    }
                });

                applySearch();
            })
            .catch(() => {
                if (emptyState) {
                    emptyState.textContent = '搜索数据加载失败，请检查 data/movies.json 是否存在。';
                    emptyState.style.display = 'block';
                }
            });
    }
})();
