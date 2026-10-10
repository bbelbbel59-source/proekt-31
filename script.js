const cards = [...document.querySelectorAll('.car-card')];
const saved = new Set();

const facts = [
  'Porsche 911 ilk bor 1963-yilda taqdim etilgan.',
  'Ferrari nomi uning asoschisi Enzo Ferrari sharafiga qo‘yilgan.',
  'BMW — Bayerische Motoren Werke so‘zlarining qisqartmasi.',
  'Porsche 911 GT3 dvigateli 9 000 ayl/min gacha ishlaydi.'
];

let factIndex = -1;
let activeFilter = 'Barchasi';

const descriptions = {
  audi: 'Markazda joylashgan V10 dvigatel va quattro to‘liq uzatmasi. R8 V10 Performance aniq boshqaruv va yuqori quvvat bilan ajralib turadi.',
  lamborghini: '5.2 litrli atmosfera V10 dvigateli va to‘liq uzatma. Huracán EVO yorqin dizayn va betakror xarakterga ega.',
  mercedes: '4.0 litrli V8 biturbo dvigatel. AMG GT S uzoq safar qulayligi va sport avtomobili ruhini uyg‘unlashtiradi.',
  porsche: 'Afsonaviy 911 ning eng sof sport xarakteri. 4.0 litrli atmosfera dvigateli, aniq boshqaruv va poyga ruhidagi aerodinamika har bir safarni unutilmas qiladi.',
  bmw: 'Kundalik qulaylik va sport quvvati bir avtomobilda. M4 Competition o‘zining 3.0 litrli ikki turboli dvigateli va dadil dizayni bilan ajralib turadi.',
  ferrari: 'Italiya dizayni va innovatsion gibrid texnologiya uyg‘unligi. V6 turbo dvigatel va elektr motor 296 GTB ga ajoyib tezlanish va o‘ziga xos xarakter beradi.'
};

/* ---------- Filter ---------- */

function applyFilter(value) {
  activeFilter = value;

  document.querySelectorAll('.filter').forEach(button => {
    const active = button.textContent.trim() === value;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active);
  });

  cards.forEach(card => {
    card.hidden = !(
      value === 'Barchasi' ||
      (value === 'Sevimlilar'
        ? saved.has(card.dataset.car)
        : card.querySelector('.car-footer > span').textContent.startsWith(value))
    );
  });

  document.querySelector('.empty')?.remove();

  if (cards.every(card => card.hidden)) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Hozircha sevimli avtomobil yo‘q. Yoqtirgan avtomobilingizdagi yurak belgisini bosing.';
    document.querySelector('.car-grid').append(empty);
  }
}

/* ---------- Favorites ---------- */

function toggleSaved(card) {
  const id = card.dataset.car;

  saved.has(id) ? saved.delete(id) : saved.add(id);

  const button = card.querySelector('.favorite');
  button.classList.toggle('saved', saved.has(id));
  button.setAttribute('aria-pressed', saved.has(id));
  button.setAttribute(
    'aria-label',
    card.querySelector('img').alt +
      (saved.has(id) ? 'ni sevimlilardan olib tashlash' : 'ni sevimlilarga qo‘shish')
  );

  applyFilter(activeFilter);
}

/* ---------- Modal ---------- */

function openDetails(card) {
  const previousFocus = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="car-title">
      <button class="site-btn btn-icon modal-close" aria-label="Yopish">×</button>
      <img src="${card.querySelector('img').getAttribute('src')}" alt="${card.querySelector('img').alt}">
      <div class="modal-content">
        <p class="section-label">${card.querySelector('.car-footer > span').textContent}</p>
        <h2 id="car-title">${card.querySelector('img').alt}</h2>
        <p>${descriptions[card.dataset.car]}</p>
        <div class="car-specs">${card.querySelector('.car-specs').innerHTML}</div>
        <button class="site-btn btn-primary modal-save"></button>
      </div>
    </section>`;

  const saveButton = backdrop.querySelector('.modal-save');

  const update = () => {
    saveButton.textContent = saved.has(card.dataset.car)
      ? '✓ Sevimlilarga qo‘shildi'
      : '♡ Sevimlilarga qo‘shish';
  };

  update();

  saveButton.addEventListener('click', () => {
    toggleSaved(card);
    update();
  });

  const keyHandler = event => {
    if (event.key === 'Escape') close();

    if (event.key === 'Tab') {
      const focusables = [...backdrop.querySelectorAll('button')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const close = () => {
    backdrop.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', keyHandler);
    previousFocus?.focus();
  };

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) close();
  });

  backdrop.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', keyHandler);
  document.body.append(backdrop);
  document.body.style.overflow = 'hidden';
  backdrop.querySelector('.modal-close').focus();
}

/* ---------- Event listeners ---------- */

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => applyFilter(button.textContent.trim()));
});

cards.forEach(card => {
  card.querySelector('.favorite').addEventListener('click', () => toggleSaved(card));
  card.querySelector('.car-footer button').addEventListener('click', () => openDetails(card));
});

document.querySelector('.hero-actions button').addEventListener('click', () => {
  openDetails(cards[0]);
});

document.querySelector('.experience button').addEventListener('click', event => {
  factIndex = (factIndex + 1) % facts.length;
  document.querySelector('.experience p[aria-live]').textContent = facts[factIndex];
  event.currentTarget.innerHTML = 'Yana bir fakt <span aria-hidden="true">↗</span>';
});

/* ---------- Mobile menu ---------- */

document.querySelector('.menu-button').addEventListener('click', event => {
  const nav = document.querySelector('.navigation');
  nav.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open'));
});

document.querySelectorAll('.navigation a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.navigation').classList.remove('open');
    document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Header favorites button ---------- */

document.querySelector('.header-actions > button').addEventListener('click', () => {
  applyFilter('Sevimlilar');
  document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Spotlight ---------- */

document.querySelector('.spotlight button').addEventListener('click', () => {
  openDetails(cards.find(card => card.dataset.car === 'lamborghini'));
});

/* ---------- Comparison ---------- */

const vehicleData = cards.map(card => ({
  id: card.dataset.car,
  name: card.querySelector('img').alt,
  image: card.querySelector('img').getAttribute('src'),
  stats: [...card.querySelectorAll('.car-specs span')].map(span => parseFloat(span.textContent))
}));

function updateComparison() {
  const columns = [...document.querySelectorAll('.comparison-column')];

  const vehicles = columns.map(column =>
    vehicleData.find(car => car.id === column.querySelector('select').value)
  );

  columns.forEach((column, i) => {
    column.querySelector('img').src = vehicles[i].image;
    column.querySelector('img').alt = vehicles[i].name;
    column.querySelector('h3').textContent = vehicles[i].name;
  });

  document.querySelectorAll('.comparison-row').forEach((row, i) => {
    const spans = row.querySelectorAll(':scope > span');
    const units = ['ot kuchi', 'soniya', 'km/soat'];

    spans.forEach((span, j) => {
      const a = vehicles[j].stats[i];
      const b = vehicles[1 - j].stats[i];

      span.textContent = a + ' ' + units[i];
      span.classList.toggle('winner', i === 1 ? a < b : a > b);
    });
  });
}

document.querySelectorAll('.comparison-column select').forEach(select => {
  select.addEventListener('change', updateComparison);
});