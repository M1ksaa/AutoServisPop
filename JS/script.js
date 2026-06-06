
const DURATION = 600;   // animation duration in ms
const STAGGER  = 120;   // delay between sibling elements in ms
const OFFSET   = 0.13;  // how much of element must be visible to trigger (0–1)

// Elements to animate and their entrance style
// [selector, animation-type]
const TARGETS = [
  ['nav',                     'fadeDown' ],
  ['.introduction h2',        'fadeUp'   ],
  ['.introduction h1',        'fadeUp'   ],
  ['.introduction p',         'fadeUp'   ],
  ['.Perk',                   'pop'      ],
  ['.ServicesIntroduction h2','fadeUp'   ],
  ['.ServicesIntroduction h1','fadeUp'   ],
  ['.ServicesIntroduction .description', 'fadeUp'],
  ['.Usluga',                 'pop'      ],
  ['.CallUs h1',              'fadeUp'   ],
  ['.CallUs button',          'pop'      ],
  ['.Recenzija',              'slideRight'],
  ['.bannerKontakt .introduction h1', 'fadeUp'],
  ['.bannerKontakt .introduction p',  'fadeUp'],
  ['.Raspored',               'fadeUp'   ],
  ['.FooterInfo > div',       'fadeUp'   ],
];

const START = {
  fadeUp:     { opacity: 0, transform: 'translateY(36px)'   },
  fadeDown:   { opacity: 0, transform: 'translateY(-24px)'  },
  fadeIn:     { opacity: 0, transform: 'none'               },
  pop:        { opacity: 0, transform: 'scale(0.88)'        },
  slideRight: { opacity: 0, transform: 'translateX(-40px)'  },
};

function applyStart(el, type) {
  const s = START[type] || START.fadeUp;
  el.style.opacity       = s.opacity;
  el.style.transform     = s.transform;
  el.style.transition    = 'none';
  el.style.willChange    = 'opacity, transform';
}

function applyEnd(el, delayMs) {
  setTimeout(() => {
    el.style.transition  = `opacity ${DURATION}ms cubic-bezier(.22,1,.36,1), transform ${DURATION}ms cubic-bezier(.22,1,.36,1)`;
    el.style.opacity     = '1';
    el.style.transform   = 'none';
  }, delayMs);
}

function groupByParent(elements) {
  const map = new Map();
  elements.forEach(el => {
    const key = el.parentElement || 'root';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(el);
  });
  return map;
}

function init() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const index = parseInt(el.dataset.animIndex  || '0', 10);
      const delay = parseInt(el.dataset.animDelay  || '0', 10);
      applyEnd(el, index * STAGGER + delay);
      observer.unobserve(el);
    });
  }, { threshold: OFFSET });

  TARGETS.forEach(([selector, type]) => {
    const found = Array.from(document.querySelectorAll(selector));
    if (!found.length) return;

    // group siblings so stagger applies per-group, not globally
    const groups = groupByParent(found);

    groups.forEach(siblings => {
      siblings.forEach((el, i) => {
        applyStart(el, type);
        el.dataset.animIndex = i;
        el.dataset.animDelay = 0;
        // small forced reflow so transition: none takes effect before observe
        void el.offsetWidth;
        observer.observe(el);
      });
    });
  });
}

// Nav is already in viewport on load — give it a tiny entrance delay
function animateNavOnLoad() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  applyStart(nav, 'fadeDown');
  void nav.offsetWidth;
  applyEnd(nav, 80);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { animateNavOnLoad(); init(); });
} else {
  animateNavOnLoad();
  init();
}
