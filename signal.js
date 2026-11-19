(() => {
  'use strict';
  const KEY = 'ww.signal.seen.v1';
  const CODE = 'REDACTED07';
  // 익명으로 남긴 사전 기록. 화면에는 작성자 신원을 표시하지 않습니다.
  const messages = [
    '안녕. 잠시만 읽어 줘.',
    '기관이 감춘 기록을 확인할 수 있도록, 이곳에 열쇠를 남긴다.',
    '내 말만 믿을 필요는 없어. 기록은 직접 확인하고 판단해.',
    `관리자 접근 코드: ${CODE}`,
    '이 메시지는 사라지지 않아.'
  ];
  let busy = false, seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch {}
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function play() {
    if (busy) return;
    busy = true;
    const focus = document.activeElement;
    const openDialog = document.querySelector('dialog[open]');
    if (openDialog) openDialog.close();
    const overlay = document.createElement('div');
    overlay.className = 'signal-overlay';
    overlay.tabIndex = -1;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '익명의 기록');
    const line = document.createElement('div');
    line.className = 'signal-line';
    const words = document.createElement('span');
    words.setAttribute('aria-hidden', 'true');
    const announcer = document.createElement('span');
    announcer.className = 'signal-sr';
    announcer.setAttribute('role', 'status');
    line.append(words);
    overlay.append(line, announcer);
    const siblings = [...document.body.children].filter(n => !['SCRIPT','STYLE'].includes(n.tagName));
    const previous = siblings.map(n => [n, n.inert]);
    try {
      document.body.append(overlay);
      previous.forEach(([n]) => { n.inert = true; });
      overlay.focus({preventScroll: true});
      document.documentElement.classList.add('signal-active');
      await wait(reduced() ? 200 : 1100);
      overlay.classList.add('signal-ready');
      for (const message of (seen ? [CODE] : messages)) {
        words.textContent = '';
        announcer.textContent = '';
        if (reduced()) words.textContent = message;
        else for (const char of message) {
          words.textContent += char;
          line.scrollLeft = line.scrollWidth;
          await wait(/[.,:?!]/.test(char) ? 190 : 62);
        }
        announcer.textContent = message;
        await wait(message.includes(CODE) ? 6500 : Math.max(2400, message.length * 85));
        line.classList.add('signal-erasing');
        await wait(380);
        words.textContent = '';
        line.classList.remove('signal-erasing');
      }
      seen = true;
      try { localStorage.setItem(KEY, '1'); } catch {}
      overlay.classList.add('signal-leaving');
      await wait(800);
    } finally {
      document.documentElement.classList.remove('signal-active');
      overlay.remove();
      previous.forEach(([n, inert]) => { n.inert = inert; });
      if (openDialog) openDialog.showModal();
      if (focus?.isConnected) focus.focus({preventScroll: true});
      busy = false;
    }
  }
  window.addEventListener('keydown', event => {
    if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && (event.code === 'KeyI' || event.key.toLowerCase() === 'i')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) void play();
    }
    if (busy && ['Tab', 'Escape'].includes(event.key)) event.preventDefault();
  }, true);
})();
