(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  var SEASONS = [
    { key: 'all', label: 'All' },
    { key: 'mothers-fathers-day', label: "Mother & Father's Day" },
    { key: 'international-cat-dog-days', label: 'International Cat & Dog Days' }
  ];
  var INDUSTRIES = [
    { key: 'food', label: 'Food & Drink', words: ['meal', 'treat', 'snack', 'coffee', 'chocolate', 'cookie', 'food', 'wine', 'tea', 'bake', 'hamper', 'essentials pack', 'brew', 'candy', 'soda', 'smoothie'] },
    { key: 'beauty', label: 'Beauty', words: ['skincare', 'makeup', 'beauty', 'spa', 'glow', 'cosmetic', 'perfume', 'hair', 'nail'] },
    { key: 'gift', label: 'Gifts & Occasions', words: ['gift', 'holiday', 'birthday', 'anniversary', 'wedding', 'christmas', 'valentine', 'celebration', 'corporate'] },
    { key: 'home', label: 'Home & Garden', words: ['home', 'candle', 'kitchen', 'bedding', 'dinner', 'plant', 'garden', 'comfort', 'decor', 'mug', 'coaster'] },
    { key: 'clothing', label: 'Clothing', words: ['shirt', 'apparel', 'cloth', 'sock', 'hoodie', 'tee', 'scarf', 'wardrobe', 'outfit', 'swim'] },
    { key: 'jewelry', label: 'Jewelry', words: ['jewel', 'necklace', 'bracelet', 'earring', 'ring', 'charm'] },
    { key: 'wellness', label: 'Health & Wellness', words: ['wellness', 'health', 'yoga', 'vitamin', 'supplement', 'self-care', 'recovery'] },
    { key: 'pet', label: 'Pet Supplies', words: ['cat', 'dog', 'pup', 'pet', 'grooming', 'chewer'] },
    { key: 'toys', label: 'Toys & Hobbies', words: ['toy', 'figure', 'puzzle', 'game', 'craft', 'hobby', 'model'] },
    { key: 'baby', label: 'Baby & Kids', words: ['newborn', 'baby', 'kid', 'nursery', 'diaper'] },
    { key: 'sports', label: 'Sports & Outdoors', words: ['sport', 'gym', 'fitness', 'outdoor', 'camp', 'hike', 'run', 'cycling', 'adventure'] }
  ];

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function getIndustry(name) {
    var normalizedName = String(name || '').toLowerCase();
    for (var index = 0; index < INDUSTRIES.length; index += 1) {
      var industry = INDUSTRIES[index];
      for (var wordIndex = 0; wordIndex < industry.words.length; wordIndex += 1) {
        if (normalizedName.indexOf(industry.words[wordIndex]) !== -1) {
          return industry.key;
        }
      }
    }
    return 'other';
  }

  function getIndustryLabel(key) {
    if (Array.isArray(key)) {
      if (key.length === 0 || key.indexOf('all') !== -1) {
        return 'Filters';
      }
      if (key.length === 1) {
        return getIndustryLabel(key[0]);
      }
      return key.length + ' industries';
    }
    if (key === 'all') {
      return 'Filters';
    }
    for (var index = 0; index < INDUSTRIES.length; index += 1) {
      if (INDUSTRIES[index].key === key) {
        return INDUSTRIES[index].label;
      }
    }
    return 'Other';
  }

  function normalizeIndustrySelection(value) {
    var selected = Array.isArray(value) ? value.slice() : [value || 'all'];
    selected = selected.filter(function (key, index) {
      return key && selected.indexOf(key) === index;
    });
    if (selected.length === 0 || selected.indexOf('all') !== -1) {
      return ['all'];
    }
    return selected;
  }

  function isIndustryActive(state, key) {
    return normalizeIndustrySelection(state.industries).indexOf(key) !== -1;
  }

  function toggleIndustrySelection(state, key) {
    if (key === 'all') {
      state.industries = ['all'];
      return;
    }
    var selected = normalizeIndustrySelection(state.industries).filter(function (industry) {
      return industry !== 'all';
    });
    var existingIndex = selected.indexOf(key);
    if (existingIndex === -1) {
      selected.push(key);
    } else {
      selected.splice(existingIndex, 1);
    }
    state.industries = selected.length ? selected : ['all'];
  }

  function createFilterButton(label, attribute, value, active) {
    var button = document.createElement('button');
    var check = document.createElement('span');
    var text = document.createElement('span');
    button.type = 'button';
    button.setAttribute(attribute, value);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    check.className = 'easify-demo-catalog__filter-check';
    check.setAttribute('aria-hidden', 'true');
    check.innerHTML = '<svg fill="none" viewBox="0 0 12 9"><path d="M1 4.5 4.2 7.5 11 1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/></svg>';
    text.className = 'easify-demo-catalog__filter-text';
    text.textContent = label;
    button.appendChild(check);
    button.appendChild(text);
    return button;
  }

  function createPlaceholder(name) {
    var placeholder = document.createElement('div');
    placeholder.className = 'easify-demo-catalog__placeholder';
    placeholder.innerHTML = '<svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="m5 18 5-5 3 3 2-2 4 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>';
    var caption = document.createElement('span');
    caption.textContent = name + ' template screenshot';
    placeholder.appendChild(caption);
    return placeholder;
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'easify-demo-catalog__card';

    var preview = document.createElement('div');
    preview.className = 'easify-demo-catalog__preview';
    if (item.image) {
      var image = document.createElement('img');
      image.alt = item.name + ' template screenshot';
      image.decoding = 'async';
      image.loading = 'lazy';
      image.src = item.image;
      image.addEventListener('error', function () {
        image.remove();
        preview.appendChild(createPlaceholder(item.name));
      }, { once: true });
      preview.appendChild(image);
    } else {
      preview.appendChild(createPlaceholder(item.name));
    }

    var footer = document.createElement('div');
    footer.className = 'easify-demo-catalog__card-footer';
    var title = document.createElement('h3');
    title.textContent = item.name;
    var button = document.createElement('button');
    button.className = 'ez-button ez-button--primary easify-demo-catalog__view';
    button.type = 'button';
    button.textContent = 'View';
    button.setAttribute('data-demo-open', item.slug);
    button.setAttribute('data-demo-name', item.name);
    footer.appendChild(title);
    footer.appendChild(button);

    article.appendChild(preview);
    article.appendChild(footer);
    return article;
  }

  function setActiveButtons(root, selector, attribute, value) {
    toArray(root.querySelectorAll(selector)).forEach(function (button) {
      var active = button.getAttribute(attribute) === value;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function baseRows(catalog, state) {
    return catalog.filter(function (item) {
      if (item.type !== state.type || item.layout !== state.layout) {
        return false;
      }
      if (state.layout !== 'seasonal' || state.season === 'all') {
        return true;
      }
      return item.season === state.season;
    });
  }

  function renderFilters(root, catalog, state) {
    var industryContainer = root.querySelector('[data-demo-industry-filters]');
    var seasonContainer = root.querySelector('[data-demo-season-filters]');
    var seasonGroup = root.querySelector('[data-demo-season-group]');
    industryContainer.replaceChildren();
    industryContainer.appendChild(createFilterButton('All', 'data-demo-industry', 'all', isIndustryActive(state, 'all')));
    INDUSTRIES.forEach(function (industry) {
      industryContainer.appendChild(createFilterButton(industry.label, 'data-demo-industry', industry.key, isIndustryActive(state, industry.key)));
    });
    industryContainer.appendChild(createFilterButton('Other', 'data-demo-industry', 'other', isIndustryActive(state, 'other')));

    var isSeasonal = state.layout === 'seasonal';
    seasonGroup.hidden = !isSeasonal;
    seasonContainer.replaceChildren();
    if (isSeasonal) {
      SEASONS.forEach(function (season) {
        seasonContainer.appendChild(createFilterButton(season.label, 'data-demo-season', season.key, state.season === season.key));
      });
    }
  }

  function render(root) {
    var catalog = window.EasifyDemoCatalog;
    var state = root._easifyDemoState;
    var grid = root.querySelector('[data-demo-grid]');
    var empty = root.querySelector('[data-demo-empty]');
    var filterLabel = root.querySelector('[data-demo-filter-label]');

    if (!Array.isArray(catalog)) {
      empty.textContent = 'Template catalog could not be loaded.';
      empty.hidden = false;
      return;
    }

    setActiveButtons(root, '[data-demo-type]', 'data-demo-type', state.type);
    setActiveButtons(root, '[data-demo-layout]', 'data-demo-layout', state.layout);
    renderFilters(root, catalog, state);

    var selectedIndustries = normalizeIndustrySelection(state.industries);
    var rows = baseRows(catalog, state).filter(function (item) {
      if (selectedIndustries.indexOf('all') !== -1) {
        return true;
      }
      return selectedIndustries.indexOf(getIndustry(item.name)) !== -1;
    });

    if (window.EasifyMotion && typeof window.EasifyMotion.disconnect === 'function') {
      window.EasifyMotion.disconnect(grid);
    }

    grid.replaceChildren();
    rows.forEach(function (item) {
      grid.appendChild(createCard(item));
    });

    empty.hidden = rows.length !== 0;
    filterLabel.textContent = getIndustryLabel(selectedIndustries);
    if (window.EasifyMotion && typeof window.EasifyMotion.refresh === 'function') {
      window.requestAnimationFrame(function () {
        window.EasifyMotion.refresh(grid);
      });
    }
  }

  function closeFilter(root) {
    var toggle = root.querySelector('[data-demo-filter-toggle]');
    var panel = root.querySelector('[data-demo-filter-panel]');
    toggle.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }

  function openTemplate(root, slug) {
    var storeBase = root.getAttribute('data-store-base') || '';
    var templateUrl = new URL(slug, storeBase);
    templateUrl.searchParams.set('utm_source', 'in-app');
    templateUrl.searchParams.set('utm_medium', 'template');
    window.open(templateUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  function closeTemplate(root) {
    var modal = root.querySelector('[data-demo-modal]');
    var frame = root.querySelector('[data-demo-modal-frame]');
    if (typeof modal.close === 'function' && modal.open) {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
    frame.src = 'about:blank';
  }

  function init(root) {
    if (!root || root.getAttribute('data-demo-catalog-ready') === 'true') {
      return;
    }
    root.setAttribute('data-demo-catalog-ready', 'true');
    root._easifyDemoState = {
      type: 'regular',
      layout: 'onepage',
      season: 'all',
      industries: ['all']
    };

    root.addEventListener('click', function (event) {
      var typeButton = event.target.closest('[data-demo-type]');
      if (typeButton && root.contains(typeButton)) {
        root._easifyDemoState.type = typeButton.getAttribute('data-demo-type');
        root._easifyDemoState.industries = ['all'];
        render(root);
        return;
      }

      var layoutButton = event.target.closest('[data-demo-layout]');
      if (layoutButton && root.contains(layoutButton)) {
        root._easifyDemoState.layout = layoutButton.getAttribute('data-demo-layout');
        root._easifyDemoState.season = 'all';
        root._easifyDemoState.industries = ['all'];
        render(root);
        return;
      }

      var toggle = event.target.closest('[data-demo-filter-toggle]');
      if (toggle && root.contains(toggle)) {
        event.stopPropagation();
        var panel = root.querySelector('[data-demo-filter-panel]');
        var willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        return;
      }

      var industryButton = event.target.closest('[data-demo-industry]');
      if (industryButton && root.contains(industryButton)) {
        event.stopPropagation();
        toggleIndustrySelection(root._easifyDemoState, industryButton.getAttribute('data-demo-industry'));
        render(root);
        return;
      }

      var seasonButton = event.target.closest('[data-demo-season]');
      if (seasonButton && root.contains(seasonButton)) {
        event.stopPropagation();
        root._easifyDemoState.season = seasonButton.getAttribute('data-demo-season');
        render(root);
        return;
      }

      var viewButton = event.target.closest('[data-demo-open]');
      if (viewButton && root.contains(viewButton)) {
        openTemplate(root, viewButton.getAttribute('data-demo-open'));
        return;
      }

      var closeButton = event.target.closest('[data-demo-modal-close]');
      if (closeButton && root.contains(closeButton)) {
        closeTemplate(root);
      }
    });

    document.addEventListener('click', function (event) {
      var filter = root.querySelector('.easify-demo-catalog__filter');
      if (filter && !filter.contains(event.target)) {
        closeFilter(root);
      }
    });

    var modal = root.querySelector('[data-demo-modal]');
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeTemplate(root);
      }
    });
    modal.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeTemplate(root);
    });

    render(root);
  }

  function initAll(scope) {
    var searchRoot = scope || document;
    toArray(searchRoot.querySelectorAll('[data-demo-catalog]')).forEach(init);
  }

  window.EasifyDemoCatalogApp = { init: init, initAll: initAll };
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }
}());
