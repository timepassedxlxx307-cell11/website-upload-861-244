
(function () {
    window.setupMoviePlayer = function (playUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector("[data-play-overlay]");
        var button = document.querySelector("[data-play-button]");
        var attached = false;
        var hlsObject = null;
        if (!video || !playUrl) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsObject = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsObject.loadSource(playUrl);
                hlsObject.attachMedia(video);
            } else {
                video.src = playUrl;
            }
            attached = true;
        }
        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsObject) {
                hlsObject.destroy();
            }
        });
    };
}());
