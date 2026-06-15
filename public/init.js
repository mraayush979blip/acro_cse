// Acropolis AMS — App Initialization Script
// Extracted from index.html to allow strict Content-Security-Policy (no unsafe-inline)

// Capture PWA Install Prompt as early as possible
window.addEventListener('beforeinstallprompt', function (e) {
  console.log('PWA: beforeinstallprompt captured globally');
  e.preventDefault();
  window.deferredPrompt = e;
  // Notify React if it's already listening
  window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
});

// Fail-safe logic: show recovery UI if React doesn't mount within 10 seconds
(function () {
  var checkDelay = 10000;
  var root = document.getElementById('root');
  var recovery = document.getElementById('mount-recovery');
  var splash = document.getElementById('initial-splash');

  var timeoutId = setTimeout(function () {
    if (root && root.innerHTML === '') {
      recovery.style.display = 'flex';
    }
  }, checkDelay);

  if (root) {
    var observer = new MutationObserver(function () {
      if (root.innerHTML !== '') {
        if (splash) {
          splash.style.opacity = '0';
          setTimeout(function () { splash.remove(); }, 500);
        }
        recovery.style.display = 'none';
        clearTimeout(timeoutId);
        observer.disconnect();
      }
    });
    observer.observe(root, { childList: true });
  }
})();

// Force update: clears SW, cache, session/local storage and hard reloads
function forceAppUpdate() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (var i = 0; i < registrations.length; i++) registrations[i].unregister();
      });
    }
    sessionStorage.clear();
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then(function (names) {
        for (var i = 0; i < names.length; i++) caches.delete(names[i]);
      });
    }
  } catch (e) {}
  window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
}
