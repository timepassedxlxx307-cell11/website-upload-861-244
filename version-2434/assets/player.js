(function () {
    var SitePlayer = {
        mount: function (url) {
            var video = document.querySelector('.video-player');
            var cover = document.querySelector('.player-cover');
            var hlsInstance = null;

            if (!video || !url) {
                return;
            }

            function attach() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                video.setAttribute('data-ready', '1');
            }

            function start() {
                attach();
                video.setAttribute('controls', 'controls');
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener('click', start);
            }
            video.addEventListener('click', start);
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };

    window.SitePlayer = SitePlayer;
}());
