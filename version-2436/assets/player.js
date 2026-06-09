(function () {
  var hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library loaded without Hls object'));
        }
      };
      script.onerror = function () {
        reject(new Error('HLS library failed to load'));
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function setError(player, message) {
    var errorNode = player.querySelector('[data-player-error]');
    player.classList.add('has-error');
    if (errorNode) {
      errorNode.textContent = message;
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-toggle]');
    var status = player.querySelector('[data-player-status]');
    var source = player.dataset.src;
    var started = false;
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (!Hls.isSupported()) {
          video.src = source;
          return;
        }
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError(player, '视频加载失败，请稍后重试。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      });
    }

    function play() {
      if (status) {
        status.textContent = '正在加载播放源...';
      }
      initialize().then(function () {
        return video.play();
      }).then(function () {
        started = true;
        video.controls = true;
        player.classList.add('is-playing');
        if (status) {
          status.textContent = '正在播放';
        }
      }).catch(function () {
        setError(player, '浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }

    function toggle() {
      if (!started || video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', toggle);
    }

    video.addEventListener('click', toggle);
    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      if (status) {
        status.textContent = '已暂停，点击继续播放';
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
