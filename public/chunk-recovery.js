(function() {
  function triggerSelfHeal() {
    try {
      var lastReload = sessionStorage.getItem('imhs_chunk_reload');
      var now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('imhs_chunk_reload', String(now));
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  }

  window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT')) {
      var src = e.target.src || e.target.href || '';
      if (src.indexOf('/_next/static/') !== -1) {
        triggerSelfHeal();
      }
    }
    if (e.message && /Loading chunk .* failed|Failed to load chunk|ChunkLoadError/i.test(e.message)) {
      triggerSelfHeal();
    }
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    var reason = e.reason ? (e.reason.message || String(e.reason)) : '';
    if (/Loading chunk .* failed|Failed to load chunk|ChunkLoadError/i.test(reason)) {
      triggerSelfHeal();
    }
  });
})();
