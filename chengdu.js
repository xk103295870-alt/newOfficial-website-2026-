// The lab uses a static cover; the animated station loads only on the detail page.
const host = document.getElementById('town-game');
if (host) {
  const error = document.getElementById('town-error');
  const loading = document.getElementById('town-loading');
  try {
    const { mountTown } = await import('./chengdu-game.js?v=tianfu-1');
    const station = await mountTown(host, {
      onError() { loading.hidden = true; error.hidden = false; },
      onReady() { loading.hidden = true; document.querySelectorAll('[data-scene-control], #scene-pause').forEach(button => { button.disabled = false; }); },
    });
    window.addEventListener('pagehide', event => { if (!event.persisted) station.destroy(); });
  } catch (errorValue) {
    console.error('Tianfu station scene could not start:', errorValue);
    loading.hidden = true; error.hidden = false;
  }
}
