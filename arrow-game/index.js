(function() {
  if (typeof window === 'undefined') return;
  const indicator = document.getElementById('indicator');
  const map = {
    ArrowUp: '↑ Up',
    ArrowDown: '↓ Down',
    ArrowLeft: '← Left',
    ArrowRight: '→ Right',
  };
  window.addEventListener('keydown', (e) => {
    if (!indicator) return;
    if (map[e.key]) {
      indicator.textContent = `Last key: ${map[e.key]}`;
      indicator.style.transition = 'transform 120ms ease';
      indicator.style.transform = 'scale(1.05)';
      setTimeout(() => indicator.style.transform = 'scale(1)', 140);
    }
  });
})();
