import './scss/style.scss';
import './scss/_yla-page.scss';

import Yla from '../../src/main.ts';

import type { YlaOptions, DisclosureTransitionType } from '../../src/type';

const container = document.querySelector<HTMLElement>('.header');
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

  return {
    breakpoint,
    duration,
    transition: transition || undefined,
    scroll: { over: scrollOver, up: scrollUp, down: scrollDown },
  };
}

function createYla(opts: YlaOptions): Yla {
  if (!container) throw new Error('Yla: header not found');
  const yla = new Yla(container, opts);
  const hamburger = document.querySelector<HTMLButtonElement>('.header__hamburger');

  const updateHamburgerExpanded = () => {
    hamburger?.setAttribute('aria-expanded', String(yla.isOpen));
  };

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
