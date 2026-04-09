import './scss/common.scss';
import './scss/yla.scss';
import './scss/yla-test.scss';

import Yla from '../../src/main.ts';

import type { YlaOptions, DisclosureTransitionType } from '../../src/type.ts';

const container = document.querySelector<HTMLElement>('.yla');
const optionsForm = document.getElementById('yla-options');
const applyButton = document.getElementById('yla-options-apply');

function getOptionsFromForm(): YlaOptions {
  const form = optionsForm;
  if (!form) return { breakpoint: 768 };

  const get = (name: string) => (form.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement)?.value;
  const breakpointRaw = get('breakpoint')?.trim();
  const breakpoint = breakpointRaw === '' ? null : Number(breakpointRaw) || null;
  const duration = Number(get('duration')) || 600;
  const transition = (get('transition')?.trim() ?? '') as DisclosureTransitionType;
  const scrollOver = Number(get('scrollOver')) || 0;
  const scrollUp = Number(get('scrollUp')) || 0;
  const scrollDown = Number(get('scrollDown')) || 0;
  const scrollLockMode = get('scrollLockMode')?.trim() ?? 'root';

  const opts: YlaOptions = {
    breakpoint,
    duration,
    transition: transition || undefined,
    scroll: { over: scrollOver, up: scrollUp, down: scrollDown },
  };
  if (scrollLockMode === 'none') {
    opts.scrolllock = false;
  } else if (scrollLockMode === 'main') {
    opts.root = '.main';
  } else {
    // root: 既定どおり `.yla-root` をロック対象にする
    opts.root = '.yla-root';
  }
  return opts;
}

function createYla(opts: YlaOptions): Yla {
  if (!container) throw new Error('Yla: header not found');
  const yla = new Yla(container, opts);

  yla.on('yla:open', () => {
    console.log('[Yla] open');
  });
  yla.on('yla:close', () => {
    console.log('[Yla] close');
  });
  yla.on('yla:anchor', () => console.log('[Yla] anchor click (drawer closed)'));
  yla.on('yla:changeMediaQuery', () => console.log('[Yla] changeMediaQuery'));

  return yla;
}

let currentYla: Yla | null = null;

function applyOptions() {
  const opts = getOptionsFromForm();
  if (currentYla) {
    currentYla.destroy();
    currentYla = null;
  }
  currentYla = createYla(opts);
  (window as unknown as { __yla?: Yla }).__yla = currentYla;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!container) return;
  applyOptions();
  applyButton?.addEventListener('click', applyOptions);
});
