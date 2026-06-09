(function () {
  "use strict";

  var video = document.getElementById("movie-player");
  var button = document.getElementById("movie-play-button");
  var hls = null;
  var ready = false;

  if (!video || !button || !window.playbackUrl) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = window.playbackUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(window.playbackUrl);
      hls.attachMedia(video);
    }
  }

  function start() {
    attach();
    button.classList.add("is-hidden");
    var request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
