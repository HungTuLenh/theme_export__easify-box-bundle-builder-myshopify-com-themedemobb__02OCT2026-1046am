(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function getRoots() {
    return toArray(document.querySelectorAll('[data-easify-final]'));
  }

  var homeStoryControllers = new Map();
  var homeStoryLifecycleReady = false;
  var homeStoryDesktopMedia = window.matchMedia('(min-width: 1200px)');
  var homeStoryReducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getViewportHeight() {
    if (window.visualViewport && window.visualViewport.height > 0) {
      return window.visualViewport.height;
    }
    return window.innerHeight || document.documentElement.clientHeight || 1024;
  }

  function getNativeScrollBehavior() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'auto';
    }
    return 'smooth';
  }

  function setupSmoothWheelScroll() {
    if (window.EasifySmoothScroll && window.EasifySmoothScroll.ready) {
      return;
    }
    if (!window.requestAnimationFrame || !window.addEventListener || !document.documentElement) {
      return;
    }

    var doc = document.documentElement;
    var body = document.body;
    var reducedMotionMedia = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var frameId = 0;
    var lastFrameTime = 0;
    var enabled = false;
    var currentY = getScrollTop();
    var targetY = currentY;
    var responseMs = 170;
    var wheelMultiplier = 0.9;

    function getScrollTop() {
      return window.pageYOffset || doc.scrollTop || (body && body.scrollTop) || 0;
    }

    function getMaxScrollTop() {
      var height = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0, doc.offsetHeight, body ? body.offsetHeight : 0);
      return Math.max(0, height - (window.innerHeight || doc.clientHeight || 0));
    }

    function clampScroll(value) {
      return Math.max(0, Math.min(value, getMaxScrollTop()));
    }

    function normalizeWheelDelta(event) {
      var delta = event.deltaY || 0;
      if (event.deltaMode === 1) {
        delta *= 44;
      } else if (event.deltaMode === 2) {
        delta *= Math.max(240, (window.innerHeight || doc.clientHeight || 800) * 0.9);
      }
      return delta * wheelMultiplier;
    }

    function getEventPath(event) {
      if (event.composedPath) {
        return event.composedPath();
      }
      var path = [];
      var node = event.target;
      while (node) {
        path.push(node);
        node = node.parentNode;
      }
      path.push(window);
      return path;
    }

    function isScrollableInDirection(element, delta) {
      if (!element || element === doc || element === body || element.nodeType !== 1) {
        return false;
      }
      var style = window.getComputedStyle(element);
      if (!/(auto|scroll|overlay)/.test(style.overflowY)) {
        return false;
      }
      var max = element.scrollHeight - element.clientHeight;
      if (max <= 1) {
        return false;
      }
      if (delta < 0) {
        return element.scrollTop > 1;
      }
      return element.scrollTop < max - 1;
    }

    function shouldLetNativeWheelHandle(event, delta) {
      if (!enabled || event.defaultPrevented || event.cancelable === false || !delta || getMaxScrollTop() <= 0) {
        return true;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return true;
      }
      if (Math.abs(event.deltaX || 0) > Math.abs(event.deltaY || 0)) {
        return true;
      }
      if (body) {
        var bodyOverflow = window.getComputedStyle(body).overflowY;
        if (bodyOverflow === 'hidden' || bodyOverflow === 'clip') {
          return true;
        }
      }
      var path = getEventPath(event);
      for (var i = 0; i < path.length; i += 1) {
        var element = path[i];
        if (!element || element.nodeType !== 1) {
          continue;
        }
        if (element.matches && element.matches('input, textarea, select, option, [contenteditable="true"], [data-ez-smooth-scroll-prevent], [data-lenis-prevent], [data-lenis-prevent-wheel], dialog[open], [aria-modal="true"], [role="dialog"]')) {
          return true;
        }
        if (isScrollableInDirection(element, delta)) {
          return true;
        }
      }
      return false;
    }

    function renderFrame(timestamp) {
      if (!enabled) {
        frameId = 0;
        lastFrameTime = 0;
        return;
      }
      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }
      var deltaTime = Math.min(64, timestamp - lastFrameTime);
      lastFrameTime = timestamp;
      var damping = 1 - Math.exp(-deltaTime / responseMs);
      currentY += (targetY - currentY) * damping;

      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        doc.classList.remove('ez-smooth-scroll-running');
        frameId = 0;
        lastFrameTime = 0;
        return;
      }

      window.scrollTo(0, currentY);
      doc.classList.add('ez-smooth-scroll-running');
      frameId = window.requestAnimationFrame(renderFrame);
    }

    function requestRender() {
      if (!frameId) {
        currentY = getScrollTop();
        frameId = window.requestAnimationFrame(renderFrame);
      }
    }

    function handleWheel(event) {
      var delta = normalizeWheelDelta(event);
      if (shouldLetNativeWheelHandle(event, delta)) {
        return;
      }
      targetY = clampScroll(targetY + delta);
      event.preventDefault();
      requestRender();
    }

    function syncFromNativeScroll() {
      if (frameId) {
        return;
      }
      currentY = getScrollTop();
      targetY = currentY;
    }

    function handleResize() {
      targetY = clampScroll(targetY);
      currentY = clampScroll(currentY);
    }

    function enable() {
      if (enabled || reducedMotionMedia.matches) {
        return;
      }
      enabled = true;
      currentY = getScrollTop();
      targetY = currentY;
      doc.classList.add('ez-smooth-scroll-active');
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('scroll', syncFromNativeScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
    }

    function disable() {
      if (!enabled) {
        return;
      }
      enabled = false;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      lastFrameTime = 0;
      doc.classList.remove('ez-smooth-scroll-active');
      doc.classList.remove('ez-smooth-scroll-running');
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', syncFromNativeScroll);
      window.removeEventListener('resize', handleResize);
      syncFromNativeScroll();
    }

    function syncPreference() {
      if (reducedMotionMedia.matches) {
        disable();
        return;
      }
      enable();
    }

    window.EasifySmoothScroll = {
      ready: true,
      scrollTo: function (top, options) {
        var immediate = options && options.immediate;
        targetY = clampScroll(Number(top) || 0);
        if (!enabled || immediate) {
          currentY = targetY;
          window.scrollTo(0, targetY);
          syncFromNativeScroll();
          return;
        }
        requestRender();
      },
      refresh: syncFromNativeScroll,
      destroy: disable
    };

    if (reducedMotionMedia.addEventListener) {
      reducedMotionMedia.addEventListener('change', syncPreference);
    } else if (reducedMotionMedia.addListener) {
      reducedMotionMedia.addListener(syncPreference);
    }
    syncPreference();
  }

  function requestHomeStorySyncs() {
    homeStoryControllers.forEach(function (controller, element) {
      if (!element.isConnected) {
        controller.cleanup();
        homeStoryControllers.delete(element);
        return;
      }
      controller.requestSync();
    });
  }

  function registerHomeStoryController(element, requestSync, cleanup) {
    homeStoryControllers.set(element, {
      cleanup: cleanup,
      requestSync: requestSync
    });
  }

  function cleanupHomeStoryControllers(scope) {
    if (!scope) {
      return;
    }
    homeStoryControllers.forEach(function (controller, element) {
      var linkedTeam = element._easifyHomePricingTeam;
      var containsElement = scope === element || (scope.contains && scope.contains(element));
      var containsLinkedTeam = linkedTeam && (scope === linkedTeam || (scope.contains && scope.contains(linkedTeam)));
      if (containsElement || containsLinkedTeam) {
        controller.cleanup();
        homeStoryControllers.delete(element);
      }
    });
  }

  function handleHomeStorySectionUnload(event) {
    cleanupHomeStoryControllers(event.target);
    cleanupSiteMotion(event.target);
    requestHomeStorySyncs();
  }

  function bindHomeStoryLifecycle() {
    if (homeStoryLifecycleReady) {
      return;
    }
    homeStoryLifecycleReady = true;
    homeStoryDesktopMedia.addEventListener('change', requestHomeStorySyncs);
    homeStoryReducedMotionMedia.addEventListener('change', requestHomeStorySyncs);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', requestHomeStorySyncs);
    }
    document.addEventListener('shopify:section:unload', handleHomeStorySectionUnload);
  }

  var motionObserver = null;
  var motionReducedMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  var motionRules = [
    { selector: '.bb-footer-card', type: 'surface' },
    {
      selector: '.ez-stats__card, .ez-demo-boosters__grid > div, .easify-demo-catalog__card, [data-review-category], .ez-pricing-plan-card, .ez-faq-item',
      type: 'card'
    },
    {
      selector: '.bb-pricing-card, .easify-demo-comparison > div > div, .character-stage, .customizer',
      type: 'surface'
    },
    {
      selector: '.ez-stats__mascot-image, .bb-pricing-tree-image, .ez-mascot-cta__art, .easify-demo-catalog__preview',
      type: 'media'
    },
    {
      selector: 'section h1, section h2, h1[data-bb-hide][data-reveal="fade"], h2[data-bb-hide][data-reveal="fade"], h3[data-bb-hide][data-reveal="fade"]',
      type: 'heading'
    },
    {
      selector: '.ez-button, .ez-mascot-cta__button, [data-bb-hide][data-reveal="pop"]',
      type: 'action'
    },
    {
      selector: '.easify-demo-catalog__types, .easify-demo-catalog__toolbar, [data-testimonial-filters], .bb-pricing-metrics, .ez-pricing-plans__badges',
      type: 'cluster'
    },
    {
      selector: 'section p, [data-bb-hide][data-reveal="fade"]:not(h1):not(h2):not(h3), .ez-mascot-cta__eyebrow, .ez-mascot-cta__note',
      type: 'copy'
    }
  ];

  function queryMotionElements(scope, selector) {
    var elements = [];
    if (scope.nodeType === 1 && scope.matches(selector)) {
      elements.push(scope);
    }
    return elements.concat(toArray(scope.querySelectorAll(selector)));
  }

  function hasLocalMotionOwner(element) {
    var isLegacyReveal = element.hasAttribute('data-bb-hide') && element.hasAttribute('data-reveal');
    if (element.closest('[data-easify-hero], [data-easify-home-ai], [data-easify-team], [data-home-pricing-reveal]')) {
      return true;
    }
    if (element.closest('.bb-about')) {
      return !isLegacyReveal;
    }
    if (element.closest('.bb-morph, .bb-features, .ez-home-reviews__track')) {
      return true;
    }
    if (element.hasAttribute('data-reveal') && !element.hasAttribute('data-bb-hide')) {
      return true;
    }
    return false;
  }

  function shouldSkipMotion(element) {
    if (element.getAttribute('data-ez-motion-bound') === 'true') {
      return true;
    }
    if (element.closest('[hidden], [aria-hidden="true"]')) {
      return true;
    }
    if (hasLocalMotionOwner(element)) {
      return true;
    }
    if (element.parentElement && element.parentElement.closest('[data-ez-motion]')) {
      return true;
    }
    return false;
  }

  function getMotionObserver() {
    if (motionObserver || typeof IntersectionObserver !== 'function') {
      return motionObserver;
    }
    motionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('is-ez-motion-visible');
        motionObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    return motionObserver;
  }

  function isMotionElementInView(element) {
    var rect = element.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom > 0 && rect.top < viewportHeight * 0.96;
  }

  function bindMotionElement(element, type, order) {
    if (shouldSkipMotion(element)) {
      return;
    }

    var delay = Math.min(order, 5) * 50;
    if (element.closest('.bb-about-copy')) {
      if (element.matches('p, [data-reveal="fade"]:not(h1):not(h2):not(h3)')) {
        delay = 120;
      } else if (element.matches('a, button, [data-reveal="pop"]')) {
        delay = 220;
      }
    }
    element.setAttribute('data-ez-motion', type);
    element.setAttribute('data-ez-motion-bound', 'true');
    element.style.setProperty('--ez-motion-delay', delay + 'ms');
    if (type === 'media') {
      var offset = '-16px';
      if (order % 2 === 1) {
        offset = '16px';
      }
      element.style.setProperty('--ez-motion-x', offset);
    }

    if (motionReducedMedia.matches || isMotionElementInView(element)) {
      element.classList.add('is-ez-motion-visible');
      return;
    }

    var observer = getMotionObserver();
    if (!observer) {
      element.classList.add('is-ez-motion-visible');
      return;
    }
    observer.observe(element);
  }

  function setupSiteMotion(scope) {
    var searchRoot = scope || document;
    var groupState = new Map();

    motionRules.forEach(function (rule) {
      queryMotionElements(searchRoot, rule.selector).forEach(function (element) {
        var group = element.closest('section, footer, [data-demo-catalog]');
        if (!group) {
          group = element.parentElement || document.body;
        }
        var counts = groupState.get(group);
        if (!counts) {
          counts = {};
          groupState.set(group, counts);
        }
        var order = counts[rule.type] || 0;
        counts[rule.type] = order + 1;
        bindMotionElement(element, rule.type, order);
      });
    });

    if (motionReducedMedia.matches) {
      document.documentElement.classList.remove('ez-motion-ready');
      return;
    }
    document.documentElement.classList.add('ez-motion-ready');
  }

  function syncMotionPreference() {
    if (!motionReducedMedia.matches) {
      setupSiteMotion(document);
      return;
    }
    if (motionObserver) {
      motionObserver.disconnect();
      motionObserver = null;
    }
    document.documentElement.classList.remove('ez-motion-ready');
    toArray(document.querySelectorAll('[data-ez-motion]')).forEach(function (element) {
      element.classList.add('is-ez-motion-visible');
    });
  }

  function cleanupSiteMotion(scope) {
    if (!motionObserver || !scope) {
      return;
    }
    if (scope.nodeType === 1 && scope.hasAttribute('data-ez-motion')) {
      motionObserver.unobserve(scope);
    }
    if (!scope.querySelectorAll) {
      return;
    }
    toArray(scope.querySelectorAll('[data-ez-motion]')).forEach(function (element) {
      motionObserver.unobserve(element);
    });
  }

  motionReducedMedia.addEventListener('change', syncMotionPreference);
  window.EasifyMotion = {
    disconnect: function (scope) {
      cleanupSiteMotion(scope);
    },
    refresh: function (scope) {
      setupSiteMotion(scope || document);
    }
  };



  function setupDemoChoiceGroups(root) {
    var choices = toArray(root.querySelectorAll('[data-role="boxtype"], [data-role="tab"], [data-role="chip"]'));
    choices.forEach(function (choice) {
      choice.setAttribute('tabindex', '0');
      choice.setAttribute('role', 'button');
      choice.addEventListener('click', function () {
        var role = choice.getAttribute('data-role');
        var group = choice.parentElement;
        if (!role || !group) {
          return;
        }
        toArray(group.querySelectorAll('[data-role="' + role + '"]')).forEach(function (item) {
          item.setAttribute('data-on', item === choice ? 'true' : 'false');
        });
      });
      choice.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        event.preventDefault();
        choice.click();
      });
    });
  }

  function setupSiteMenus(root) {
    toArray(root.querySelectorAll('[data-site-nav]')).forEach(function (nav) {
      var button = nav.querySelector('.bb-menu-toggle');
      var links = nav.querySelector('.bb-nav-links');
      if (!button || !links || nav.getAttribute('data-menu-ready') === 'true') {
        return;
      }
      nav.setAttribute('data-menu-ready', 'true');

      function setOpen(open) {
        nav.setAttribute('data-menu-open', open ? 'true' : 'false');
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }

      button.addEventListener('click', function () {
        var isOpen = nav.getAttribute('data-menu-open') === 'true';
        setOpen(!isOpen);
      });

      toArray(links.querySelectorAll('a')).forEach(function (link) {
        link.addEventListener('click', function () {
          setOpen(false);
        });
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      });
    });
  }

  function setupHomeViewportExtras(root) {
    var homeRoot = root.querySelector('.bb-root');
    if (!homeRoot) {
      return;
    }

    if (homeRoot.getAttribute('data-home-motion-ready') !== 'true') {
      homeRoot.setAttribute('data-home-motion-ready', 'true');
      window.requestAnimationFrame(function () {
        homeRoot.style.setProperty('--play', 'running');
      });
    }
    if (window.location.hash === '#blog' && homeRoot.getAttribute('data-home-blog-scroll-ready') !== 'true') {
      homeRoot.setAttribute('data-home-blog-scroll-ready', 'true');
      var scrollToGameZone = function () {
        var gameZone = homeRoot.querySelector('#blog') || document.getElementById('blog');
        if (gameZone) {
          var targetTop = gameZone.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: targetTop, behavior: getNativeScrollBehavior() });
        }
      };
      window.requestAnimationFrame(scrollToGameZone);
      window.setTimeout(scrollToGameZone, 120);
      window.setTimeout(scrollToGameZone, 420);
    }

  }

  function setupHomeAboutStory(root) {
    if (root.getAttribute('data-page-variant') !== 'home') {
      return;
    }

    var stage = root.querySelector('[data-about-story]');
    var panel = stage ? stage.querySelector('.bb-about') : null;
    var collage = stage ? stage.querySelector('.bb-collage') : null;
    if (!stage || !panel || !collage) {
      return;
    }
    if (stage.getAttribute('data-about-story-ready') === 'true') {
      return;
    }

    var compactMedia = window.matchMedia('(max-width: 1199px)');
    var mobileMedia = window.matchMedia('(max-width: 767px)');
    var reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    var frameId = 0;
    var currentCollageProgress = 0;
    var lastFrameTime = 0;
    var hasRenderedCollage = false;
    var collageResponseMs = 80;

    function clearAboutStyles() {
      stage.style.removeProperty('--bb-about-stage-height');
      stage.style.removeProperty('--bb-about-pane-height');
      stage.style.removeProperty('--bb-about-collage-opacity');
      stage.style.removeProperty('--bb-about-collage-scale');
      currentCollageProgress = 0;
      lastFrameTime = 0;
      hasRenderedCollage = false;
    }

    function syncAboutStory(frameTime) {
      frameId = 0;
      if (reducedMotionMedia.matches) {
        clearAboutStyles();
        return;
      }

      var viewportHeight = getViewportHeight();
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1440;
      var collageScale = viewportWidth / 1440;
      var stageMultiplier = 2.2;
      if (mobileMedia.matches) {
        stageMultiplier = 1.35;
      } else if (compactMedia.matches) {
        stageMultiplier = 1.85;
      }
      var stageHeight = Math.round(viewportHeight * stageMultiplier);
      stage.style.setProperty('--bb-about-stage-height', stageHeight + 'px');
      stage.style.setProperty('--bb-about-pane-height', viewportHeight + 'px');
      stage.style.setProperty('--bb-about-collage-scale', collageScale.toFixed(4));

      var stageRect = stage.getBoundingClientRect();
      var travel = stageHeight - viewportHeight;
      var rawProgress = 0;
      if (travel > 0) {
        rawProgress = Math.min(1, Math.max(0, -stageRect.top / travel));
      }
      var linearCollageProgress = Math.min(1, Math.max(0, rawProgress / 0.67));
      var collageProgress = 1 - Math.pow(1 - linearCollageProgress, 3);
      var deltaTime = 16.67;
      if (lastFrameTime > 0) {
        deltaTime = Math.min(20, Math.max(0, frameTime - lastFrameTime));
      }
      lastFrameTime = frameTime;

      if (!hasRenderedCollage || mobileMedia.matches) {
        currentCollageProgress = collageProgress;
        hasRenderedCollage = true;
      } else {
        // Damp discrete wheel steps so opacity tracks scroll without visible jumps.
        var damping = 1 - Math.exp(-deltaTime / collageResponseMs);
        currentCollageProgress += (collageProgress - currentCollageProgress) * damping;
      }

      if (Math.abs(collageProgress - currentCollageProgress) < 0.0005) {
        currentCollageProgress = collageProgress;
      }
      stage.style.setProperty('--bb-about-collage-opacity', currentCollageProgress.toFixed(4));

      if (currentCollageProgress !== collageProgress) {
        frameId = window.requestAnimationFrame(syncAboutStory);
      }
    }

    function requestAboutSync() {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(syncAboutStory);
    }

    function cleanupAboutStory() {
      window.removeEventListener('scroll', requestAboutSync);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      clearAboutStyles();
      stage.removeAttribute('data-about-story-ready');
    }

    stage.style.setProperty('--bb-about-collage-opacity', '0');
    stage.setAttribute('data-about-story-ready', 'true');
    window.addEventListener('scroll', requestAboutSync, { passive: true });
    registerHomeStoryController(stage, requestAboutSync, cleanupAboutStory);
    requestAboutSync();
  }

  function setupHomeMorphStory(root) {
    if (root.getAttribute('data-page-variant') !== 'home') {
      return;
    }

    var section = root.querySelector('.bb-morph');
    var pane = section ? section.querySelector('.bb-morph-pane') : null;
    var greyLayer = section ? section.querySelector('[data-morph-layer="grey"]') : null;
    var orangeLayer = section ? section.querySelector('[data-morph-layer="orange"]') : null;
    if (!section || !pane || !greyLayer || !orangeLayer) {
      return;
    }
    if (section.getAttribute('data-morph-story-ready') === 'true') {
      return;
    }

    var compactMedia = window.matchMedia('(max-width: 1199px)');
    var reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    var frameId = 0;

    function clearMorphStyles() {
      section.style.removeProperty('--bb-morph-stage-height');
      section.style.removeProperty('--bb-morph-pane-height');
      section.style.removeProperty('--bb-morph-grey-clip');
      section.style.removeProperty('--bb-morph-orange-clip');
    }

    function syncMorphStory() {
      frameId = 0;
      if (reducedMotionMedia.matches) {
        clearMorphStyles();
        return;
      }

      var viewportHeight = getViewportHeight();
      var compactStory = compactMedia.matches;
      var wipeDistance = 410;
      var stageHeight = (2 * viewportHeight) + wipeDistance;
      var travelBase = 2 * viewportHeight;
      if (compactStory) {
        wipeDistance = Math.max(280, Math.min(380, viewportHeight * 0.36));
        stageHeight = viewportHeight + wipeDistance;
        travelBase = viewportHeight;
      }
      section.style.setProperty('--bb-morph-stage-height', Math.round(stageHeight) + 'px');
      section.style.setProperty('--bb-morph-pane-height', viewportHeight + 'px');

      var sectionRect = section.getBoundingClientRect();
      var travel = stageHeight - travelBase;
      var progress = 0;
      if (travel > 0) {
        progress = Math.min(1, Math.max(0, -sectionRect.top / travel));
      }

      var seam = (1272 - (progress * (1272 - 168))) / 1440 * 100;
      section.style.setProperty('--bb-morph-grey-clip', 'inset(0 ' + (100 - seam).toFixed(2) + '% 0 0)');
      section.style.setProperty('--bb-morph-orange-clip', 'inset(0 0 0 ' + seam.toFixed(2) + '%)');
    }

    function requestMorphSync() {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(syncMorphStory);
    }

    function cleanupMorphStory() {
      window.removeEventListener('scroll', requestMorphSync);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      clearMorphStyles();
      section.removeAttribute('data-morph-story-ready');
    }

    section.style.setProperty('--bb-morph-grey-clip', 'inset(0 11.67% 0 0)');
    section.style.setProperty('--bb-morph-orange-clip', 'inset(0 0 0 88.33%)');
    section.setAttribute('data-morph-story-ready', 'true');
    window.addEventListener('scroll', requestMorphSync, { passive: true });
    registerHomeStoryController(section, requestMorphSync, cleanupMorphStory);
    requestMorphSync();
  }

  function setupHomeFeatureStory(root) {
    if (root.getAttribute('data-page-variant') !== 'home') {
      return;
    }

    var homeRoot = root.querySelector('.bb-root');
    if (!homeRoot) {
      return;
    }

    var section = homeRoot.querySelector('.bb-features');
    var pane = homeRoot.querySelector('.bb-feature-pane');
    var track = homeRoot.querySelector('.bb-feature-track');
    var panels = toArray(homeRoot.querySelectorAll('.bb-feature-panel'));
    if (!section || !pane || !track || panels.length === 0) {
      return;
    }
    if (section.getAttribute('data-feature-story-ready') === 'true') {
      return;
    }

    var compactMedia = window.matchMedia('(max-width: 1199px)');
    var mobileStackMedia = window.matchMedia('(max-width: 767px)');
    var reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    var frameId = 0;
    var compactFeatureScrollRatio = 1.16;

    function clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    }

    function mixFeatureBackground(progress) {
      var stops = [
        [255, 243, 231],
        [255, 228, 204],
        [255, 215, 178],
        [255, 201, 151]
      ];
      var colorPosition = clamp(progress * 3, 0, 3);
      var colorIndex = Math.min(2, Math.floor(colorPosition));
      var colorProgress = colorPosition - colorIndex;
      var startColor = stops[colorIndex];
      var endColor = stops[colorIndex + 1];
      var color = startColor.map(function (channel, channelIndex) {
        return Math.round(channel + (endColor[channelIndex] - channel) * colorProgress);
      });
      return 'rgb(' + color.join(',') + ')';
    }

    function roundedTopRadius(element, maximumRadius) {
      if (!element) {
        return maximumRadius;
      }
      var elementTop = element.getBoundingClientRect().top;
      var radiusDistance = window.innerHeight * 0.25;
      if (radiusDistance <= 0) {
        return 0;
      }
      return Math.round(clamp(elementTop / radiusDistance, 0, 1) * maximumRadius);
    }

    function clearFeatureStyles() {
      section.style.removeProperty('--bb-feature-stage-height');
      section.style.removeProperty('--bb-feature-pane-height');
      section.style.removeProperty('--bb-feature-radius');
      section.style.removeProperty('--bb-feature-background');
      section.style.removeProperty('--bb-feature-mobile-entry-gap');
      track.style.removeProperty('--bb-feature-offset');
      panels.forEach(function (panel) {
        panel.style.removeProperty('--bb-feature-panel-y');
        panel.style.removeProperty('--bb-feature-panel-radius');
      });
    }

    function getMobileFeatureEntryGap(viewportHeight) {
      var previousSection = section.previousElementSibling;
      if (!previousSection || !previousSection.matches('.bb-morph')) {
        return 0;
      }
      return Math.max(280, Math.min(380, viewportHeight * 0.36));
    }

    function syncMobileFeatureStack(progress, viewportHeight) {
      var segmentCount = Math.max(1, panels.length - 1);
      var radiusDistance = Math.max(72, Math.min(120, viewportHeight * 0.14));
      panels.forEach(function (panel, panelIndex) {
        var panelOffset = 0;
        var panelRadius = 0;
        if (panelIndex > 0) {
          var panelProgress = clamp((progress * segmentCount) - (panelIndex - 1), 0, 1);
          panelOffset = Math.round((1 - panelProgress) * viewportHeight);
          panelRadius = Math.round(clamp(panelOffset / radiusDistance, 0, 1) * 28);
        }
        panel.style.setProperty('--bb-feature-panel-y', panelOffset + 'px');
        panel.style.setProperty('--bb-feature-panel-radius', panelRadius + 'px');
      });
    }

    function syncFeatureTrack() {
      frameId = 0;
      if (reducedMotionMedia.matches) {
        clearFeatureStyles();
        return;
      }

      var viewportHeight = getViewportHeight();
      var isMobileStack = mobileStackMedia.matches;
      section.style.setProperty('--bb-feature-pane-height', viewportHeight + 'px');
      if (isMobileStack) {
        section.style.setProperty('--bb-feature-mobile-entry-gap', Math.round(getMobileFeatureEntryGap(viewportHeight)) + 'px');
      } else {
        section.style.removeProperty('--bb-feature-mobile-entry-gap');
      }

      var lastPanel = panels[panels.length - 1];
      var maxOffset = Math.max(0, lastPanel.offsetLeft);
      var stageHeight = viewportHeight + maxOffset;
      if (isMobileStack) {
        var mobileScrollDistance = viewportHeight * Math.max(1, panels.length - 1);
        stageHeight = viewportHeight + mobileScrollDistance;
      } else if (compactMedia.matches) {
        var compactScrollDistance = maxOffset / compactFeatureScrollRatio;
        stageHeight = viewportHeight + compactScrollDistance;
      }
      section.style.setProperty('--bb-feature-stage-height', Math.round(stageHeight) + 'px');

      var rect = section.getBoundingClientRect();
      var scrollDistance = section.offsetHeight - pane.offsetHeight;
      var progress = 0;
      if (scrollDistance > 0) {
        progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
      }

      if (isMobileStack) {
        track.style.setProperty('--bb-feature-offset', '0px');
        syncMobileFeatureStack(progress, viewportHeight);
      } else {
        panels.forEach(function (panel) {
          panel.style.removeProperty('--bb-feature-panel-y');
          panel.style.removeProperty('--bb-feature-panel-radius');
        });
        track.style.setProperty('--bb-feature-offset', (-maxOffset * progress).toFixed(2) + 'px');
      }
      section.style.setProperty('--bb-feature-background', mixFeatureBackground(progress));

      var maximumRadius = 40;
      if (compactMedia.matches) {
        maximumRadius = 28;
      }
      var featureRadius = roundedTopRadius(section, maximumRadius);
      section.style.setProperty('--bb-feature-radius', featureRadius + 'px');
    }

    function requestFeatureSync() {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(syncFeatureTrack);
    }

    function cleanupFeatureStory() {
      window.removeEventListener('scroll', requestFeatureSync);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      clearFeatureStyles();
      section.removeAttribute('data-feature-story-ready');
    }

    section.setAttribute('data-feature-story-ready', 'true');
    window.addEventListener('scroll', requestFeatureSync, { passive: true });
    registerHomeStoryController(section, requestFeatureSync, cleanupFeatureStory);
    requestFeatureSync();
  }

  function setupHomePricingReveal(root) {
    var revealRoot = null;
    if (root.matches && root.matches('[data-home-pricing-reveal]')) {
      revealRoot = root;
    } else {
      revealRoot = root.querySelector('[data-home-pricing-reveal]');
    }
    if (!revealRoot) {
      return;
    }

    var pricingSection = revealRoot.closest('.easify-home-pricing-section');
    if (!pricingSection) {
      return;
    }

    var teamSection = pricingSection.previousElementSibling;
    var hasTeamSection = teamSection && teamSection.matches('.easify-team-section');

    if (pricingSection.getAttribute('data-home-pricing-controller-ready') === 'true') {
      if (hasTeamSection && pricingSection._easifyHomePricingTeam === teamSection) {
        return;
      }
      if (typeof pricingSection._easifyHomePricingCleanup === 'function') {
        pricingSection._easifyHomePricingCleanup();
      }
      homeStoryControllers.delete(pricingSection);
    }

    if (!hasTeamSection) {
      return;
    }

    var reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    var compactMedia = window.matchMedia('(max-width: 1199px)');
    var teamRoot = teamSection.querySelector('.easify-team-root');
    if (!teamRoot) {
      return;
    }
    var frameId = 0;

    function clampPricingProgress(value) {
      return Math.min(1, Math.max(0, value));
    }

    function clearPricingRevealStyles() {
      teamSection.removeAttribute('data-home-pricing-handoff-ready');
      teamSection.style.removeProperty('--ez-home-pricing-panel-height');
      teamSection.style.removeProperty('--ez-home-pricing-team-content-height');
      teamSection.style.removeProperty('--ez-home-pricing-team-stage-height');
      pricingSection.removeAttribute('data-home-pricing-stage-ready');
      pricingSection.style.removeProperty('--ez-home-pricing-panel-height');
      pricingSection.style.removeProperty('--ez-home-pricing-stage-height');
      revealRoot.removeAttribute('data-home-pricing-reveal-ready');
      revealRoot.style.removeProperty('--ez-home-pricing-panel-height');
      revealRoot.style.removeProperty('--ez-home-pricing-reveal-radius');
    }

    function syncPricingReveal() {
      frameId = 0;
      if (reducedMotionMedia.matches) {
        clearPricingRevealStyles();
        return;
      }

      var panelHeight = getViewportHeight();
      var pricingStageHeight = panelHeight * 2.2;
      var teamStageHeight = pricingStageHeight;
      if (compactMedia.matches) {
        pricingStageHeight = panelHeight * 2;
        teamStageHeight = teamRoot.getBoundingClientRect().height + panelHeight;
      }
      teamSection.style.setProperty('--ez-home-pricing-panel-height', panelHeight.toFixed(2) + 'px');
      teamSection.style.setProperty('--ez-home-pricing-team-content-height', teamRoot.getBoundingClientRect().height.toFixed(2) + 'px');
      teamSection.style.setProperty('--ez-home-pricing-team-stage-height', teamStageHeight.toFixed(2) + 'px');
      pricingSection.style.setProperty('--ez-home-pricing-panel-height', panelHeight.toFixed(2) + 'px');
      pricingSection.style.setProperty('--ez-home-pricing-stage-height', pricingStageHeight.toFixed(2) + 'px');
      revealRoot.style.setProperty('--ez-home-pricing-panel-height', panelHeight.toFixed(2) + 'px');
      teamSection.setAttribute('data-home-pricing-handoff-ready', 'true');
      pricingSection.setAttribute('data-home-pricing-stage-ready', 'true');

      var sectionRect = pricingSection.getBoundingClientRect();
      var travel = panelHeight;
      if (!compactMedia.matches) {
        travel = pricingStageHeight - panelHeight;
      }
      var rawProgress = 0;
      if (travel > 0) {
        rawProgress = clampPricingProgress(-sectionRect.top / travel);
      }
      var circleProgress = clampPricingProgress(rawProgress / 0.7);
      var circleRadius = Math.pow(circleProgress, 0.72) * 75;
      revealRoot.style.setProperty('--ez-home-pricing-reveal-radius', circleRadius.toFixed(2) + '%');
      revealRoot.setAttribute('data-home-pricing-reveal-ready', 'true');
    }

    function requestPricingRevealSync() {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(syncPricingReveal);
    }

    function cleanupPricingReveal() {
      window.removeEventListener('scroll', requestPricingRevealSync);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      clearPricingRevealStyles();
      pricingSection.removeAttribute('data-home-pricing-controller-ready');
      delete pricingSection._easifyHomePricingCleanup;
      delete pricingSection._easifyHomePricingTeam;
    }

    pricingSection.setAttribute('data-home-pricing-controller-ready', 'true');
    pricingSection._easifyHomePricingCleanup = cleanupPricingReveal;
    pricingSection._easifyHomePricingTeam = teamSection;
    window.addEventListener('scroll', requestPricingRevealSync, { passive: true });
    registerHomeStoryController(pricingSection, requestPricingRevealSync, cleanupPricingReveal);
    requestPricingRevealSync();
  }

  function setupRangeInputs(root) {
    toArray(root.querySelectorAll('input[type="range"]')).forEach(function (input) {
      function updateRange() {
        var min = Number(input.min || 0);
        var max = Number(input.max || 100);
        var value = Number(input.value || 0);
        var spread = max - min;
        var percent = 0;
        if (spread > 0) {
          percent = ((value - min) / spread) * 100;
        }
        input.style.background = 'linear-gradient(90deg,#303030 ' + percent + '%,#E3E3E3 ' + percent + '%)';
      }

      input.addEventListener('input', updateRange);
      updateRange();
    });
  }

  function formatMoney(value) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  function revenueAtPosition(position) {
    if (position <= 25) {
      return Math.round((position / 25) * 500);
    }
    if (position <= 50) {
      return Math.round(500 + ((position - 25) / 25) * 4500);
    }
    if (position <= 75) {
      return Math.round(5000 + ((position - 50) / 25) * 20000);
    }
    return Math.round(25000 + ((position - 75) / 25) * 75000);
  }

  function getPricingTier(revenue) {
    if (revenue <= 500) {
      return { name: 'Start', fee: 0, level: 1 };
    }
    if (revenue <= 5000) {
      return { name: 'Grow', fee: 29, level: 2 };
    }
    if (revenue <= 25000) {
      return { name: 'Scale', fee: 99, level: 3 };
    }
    return { name: 'Thrive', fee: 199, level: 4 };
  }

  function formatFeePercent(fee, revenue) {
    if (fee === 0 || revenue === 0) {
      return '0%';
    }
    return ((fee / revenue) * 100).toFixed(2).replace(/\.00$/, '') + '%';
  }

  function formatPlanPrice(fee, decimalPlaces) {
    if (decimalPlaces > 0) {
      return '$' + fee.toFixed(decimalPlaces);
    }
    return formatMoney(fee);
  }

  function setupPricingCalculators(root) {
    toArray(root.querySelectorAll('[data-pricing-calculator]')).forEach(function (calculator) {
      if (calculator.getAttribute('data-pricing-ready') === 'true') {
        return;
      }

      var input = calculator.querySelector('[data-pricing-range]');
      var price = calculator.querySelector('[data-pricing-price]');
      var plan = calculator.querySelector('[data-pricing-plan]');
      var revenueLabel = calculator.querySelector('[data-pricing-revenue]');
      var feePercent = calculator.querySelector('[data-pricing-fee-percent]');
      var net = calculator.querySelector('[data-pricing-net]');
      var roi = calculator.querySelector('[data-pricing-roi]');
      var note = calculator.querySelector('[data-pricing-note]');
      var status = calculator.querySelector('[data-pricing-status]');
      var tree = calculator.querySelector('[data-pricing-tree]');
      var treeImage = null;
      var tickButtons = toArray(calculator.querySelectorAll('[data-pricing-position]'));
      var priceDecimals = Number(calculator.getAttribute('data-pricing-price-decimals') || 0);

      if (tree) {
        treeImage = tree.querySelector('[data-pricing-tree-image]');
      }

      if (!input || !price || !plan || !revenueLabel) {
        return;
      }

      function updateCalculator() {
        var position = Number(input.value || 0);
        var revenue = revenueAtPosition(position);
        var tier = getPricingTier(revenue);
        var netRevenue = revenue - tier.fee;
        var returnOnSpend = '—';
        var noteText = 'Every cent your boxes earn goes straight to you. The app is free at this level.';

        if (tier.fee > 0) {
          returnOnSpend = Math.round(revenue / tier.fee) + '×';
          noteText = 'You keep ' + formatMoney(netRevenue) + ' of ' + formatMoney(revenue) + '. A flat ' + formatMoney(tier.fee) + ' fee, no percentage cut.';
        }

        price.textContent = formatPlanPrice(tier.fee, priceDecimals);
        plan.textContent = tier.name;
        revenueLabel.textContent = formatMoney(revenue);
        input.style.background = 'linear-gradient(90deg,#303030 ' + position + '%,#E3E3E3 ' + position + '%)';
        input.setAttribute('aria-valuetext', formatMoney(revenue) + ' monthly box revenue, ' + tier.name + ' plan, ' + formatPlanPrice(tier.fee, priceDecimals) + ' per month');

        if (feePercent) {
          feePercent.textContent = formatFeePercent(tier.fee, revenue);
        }
        if (net) {
          net.textContent = formatMoney(netRevenue);
        }
        if (roi) {
          roi.textContent = returnOnSpend;
        }
        if (note) {
          note.textContent = noteText;
        }
        if (status) {
          status.textContent = tier.name + ' plan. ' + formatMoney(revenue) + ' monthly box revenue. ' + formatPlanPrice(tier.fee, priceDecimals) + ' per month.';
        }
        if (tree) {
          var treeLevel = String(tier.level);
          var treeScale = 0.78 + (position * 0.0025);
          tree.setAttribute('data-level', treeLevel);
          tree.style.setProperty('--pricing-tree-scale', treeScale.toFixed(3));

          if (treeImage) {
            var treeSource = treeImage.getAttribute('data-level-' + treeLevel + '-src');
            if (treeSource && treeImage.getAttribute('src') !== treeSource) {
              treeImage.setAttribute('src', treeSource);
            }
          }
        }

        var activeTick = null;
        var activeTickPosition = Number.NEGATIVE_INFINITY;
        tickButtons.forEach(function (button) {
          var tickPosition = Number(button.getAttribute('data-pricing-position'));
          var hasBeenReached = tickPosition <= position;
          if (hasBeenReached) {
            button.setAttribute('data-pricing-reached', 'true');
          } else {
            button.removeAttribute('data-pricing-reached');
          }

          if (hasBeenReached && tickPosition > activeTickPosition) {
            activeTick = button;
            activeTickPosition = tickPosition;
          }
        });

        tickButtons.forEach(function (button) {
          if (button === activeTick) {
            button.setAttribute('aria-current', 'true');
          } else {
            button.removeAttribute('aria-current');
          }
        });
      }

      input.addEventListener('input', updateCalculator);
      tickButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          input.value = button.getAttribute('data-pricing-position') || '0';
          updateCalculator();
          input.focus();
        });
      });

      calculator.setAttribute('data-pricing-ready', 'true');
      updateCalculator();
    });
  }

  function setupPricingFaq(root) {
    toArray(root.querySelectorAll('[data-pricing-faq]')).forEach(function (faq) {
      if (faq.getAttribute('data-faq-ready') === 'true') {
        return;
      }

      var buttons = toArray(faq.querySelectorAll('[data-faq-button]'));

      function setExpanded(button, expanded) {
        var panelId = button.getAttribute('aria-controls');
        var panel = panelId ? faq.querySelector('#' + panelId) : null;
        var sign = button.querySelector('[data-faq-sign]');
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (panel) {
          panel.hidden = !expanded;
        }
        if (sign) {
          sign.textContent = expanded ? '−' : '+';
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var willOpen = button.getAttribute('aria-expanded') !== 'true';
          buttons.forEach(function (item) {
            setExpanded(item, item === button && willOpen);
          });
        });
      });

      faq.setAttribute('data-faq-ready', 'true');
    });
  }

  function setupTestimonials(root) {
    toArray(root.querySelectorAll('[data-testimonials]')).forEach(function (section) {
      var filters = toArray(section.querySelectorAll('[data-testimonial-filter]'));
      var cards = toArray(section.querySelectorAll('[data-review-category]'));
      var grid = section.querySelector('[data-testimonial-grid]');
      if (!filters.length || !cards.length || !grid || section.getAttribute('data-testimonials-ready') === 'true') {
        return;
      }
      section.setAttribute('data-testimonials-ready', 'true');

      function activateFilter(category) {
        var visibleCount = 0;
        filters.forEach(function (button) {
          var isActive = button.getAttribute('data-testimonial-filter') === category;
          button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var isVisible = false;
          if (category === 'all') {
            isVisible = card.hasAttribute('data-review-featured');
          } else {
            isVisible = card.getAttribute('data-review-category') === category;
          }
          card.hidden = !isVisible;
          if (isVisible) {
            visibleCount += 1;
          }
        });
        grid.setAttribute('aria-label', 'Showing ' + visibleCount + ' testimonials');
        if (window.EasifyMotion && typeof window.EasifyMotion.refresh === 'function') {
          window.requestAnimationFrame(function () {
            window.EasifyMotion.refresh(grid);
          });
        }
      }

      filters.forEach(function (button) {
        button.addEventListener('click', function () {
          activateFilter(button.getAttribute('data-testimonial-filter') || 'all');
        });
      });
      activateFilter('all');
    });
  }

  function resolveAsset(filename) {
    var images = window.EasifyBoxBuilderImages;
    if (images && typeof images.resolve === 'function') {
      return images.resolve(filename);
    }
    return filename;
  }

  function getPageVariantFromPath() {
    var path = window.location.pathname || '';
    if (path.indexOf('/pages/testimonials') !== -1) {
      return 'testimonials';
    }
    if (path.indexOf('/pages/pricing') !== -1) {
      return 'pricing';
    }
    if (path.indexOf('/pages/demo') !== -1) {
      return 'demo';
    }
    return 'home';
  }

  function getMascotCtaDefaults(root, variant) {
    var defaultsNode = root.querySelector('[data-mascot-cta-defaults]');
    if (!defaultsNode) {
      return null;
    }
    try {
      var defaults = JSON.parse(defaultsNode.textContent || '{}');
      return defaults[variant] || null;
    } catch (error) {
      return null;
    }
  }

  function setupMascotCta(root) {
    if (!root.hasAttribute('data-mascot-cta-root')) {
      return;
    }
    if (root.getAttribute('data-cta-variant-setting') !== 'auto') {
      return;
    }

    var cta = root.querySelector('[data-mascot-cta]');
    var eyebrow = root.querySelector('[data-mascot-cta-eyebrow]');
    var heading = root.querySelector('[data-mascot-cta-heading]');
    var subtext = root.querySelector('[data-mascot-cta-subtext]');
    var button = root.querySelector('[data-mascot-cta-button]');
    var note = root.querySelector('[data-mascot-cta-note]');
    var image = root.querySelector('[data-mascot-cta-image]');
    if (!cta || !eyebrow || !heading || !subtext || !button || !note || !image) {
      return;
    }

    var variant = getPageVariantFromPath();
    var defaults = getMascotCtaDefaults(root, variant);
    if (!defaults) {
      root.setAttribute('data-mascot-cta-ready', 'true');
      return;
    }
    root.setAttribute('data-page-variant', variant);
    cta.classList.remove(
      'ez-mascot-cta--home',
      'ez-mascot-cta--full'
    );
    cta.classList.add('ez-mascot-cta--' + defaults.layout);

    eyebrow.textContent = defaults.eyebrow;
    eyebrow.hidden = !defaults.eyebrow;
    heading.textContent = defaults.heading;
    subtext.textContent = defaults.subtext;
    subtext.hidden = !defaults.subtext;
    button.textContent = defaults.buttonLabel;
    note.textContent = defaults.note;
    note.hidden = !defaults.note;
    if (root.getAttribute('data-cta-custom-mascot') !== 'true') {
      image.src = defaults.asset;
    }
    root.setAttribute('data-mascot-cta-ready', 'true');
  }

  function setupHomeGameVisibility(root) {
    if (!root.hasAttribute('data-home-game-root')) {
      return;
    }
    if (root.getAttribute('data-game-visibility') !== 'auto') {
      root.hidden = false;
      return;
    }
    root.hidden = getPageVariantFromPath() !== 'home';
  }

  function createGameAsset(filename, width, height, x, y) {
    return {
      src: resolveAsset(filename),
      w: width,
      h: height,
      x: x,
      y: y
    };
  }

  function getMiniGameAssets() {
    return {
      body: [
        createGameAsset('gameReplacementBody1', 680, 680, 0, 0),
        createGameAsset('gameReplacementBody2', 680, 680, 0, 0),
        createGameAsset('gameReplacementBody3', 680, 680, 0, 0),
        createGameAsset('gameReplacementBody4', 680, 680, 0, 0)
      ],
      eyes: [
        createGameAsset('gameReplacementEye1', 176, 55, 0, 0),
        createGameAsset('gameReplacementEye2', 172, 65, 0, -6),
        createGameAsset('gameReplacementEye3', 188, 58, -6, 0),
        createGameAsset('gameReplacementEye4', 176, 31, 1, 13)
      ],
      cheek: [
        createGameAsset('gameReplacementCheek1', 90, 90, 0, 0),
        createGameAsset('gameReplacementCheek2', 90, 90, 0, 0),
        createGameAsset('gameReplacementCheek3', 90, 90, 0, 0),
        createGameAsset('gameReplacementCheek4', 90, 90, 0, 0)
      ],
      mouth: [
        createGameAsset('gameReplacementMouth1', 83, 29, 19, 22),
        createGameAsset('gameReplacementMouth2', 122, 72, 0, 0),
        createGameAsset('gameReplacementMouth3', 122, 73, 0, 0),
        createGameAsset('gameReplacementMouth4', 122, 76, 0, 0)
      ],
      accessory: [
        createGameAsset('gameReplacementAccessory1', 248, 248, 0, 0),
        createGameAsset('gameReplacementAccessory2', 120, 120, 64, 64),
        createGameAsset('gameReplacementAccessory3', 250.66665649414062, 188, -1, 30),
        createGameAsset('gameReplacementAccessory4', 231, 90, 0, 0)
      ]
    };
  }

  function getMiniGameGroups() {
    return [
      { key: 'body', label: 'BODY', mobileLabel: 'Body', names: ['Wave', 'Arms', 'Stand', 'Hello'] },
      { key: 'eyes', label: 'EYES', mobileLabel: 'Eyes', names: ['Bright', 'Wink', 'Smile', 'Dreamy'] },
      { key: 'cheek', label: 'CHEEKS', mobileLabel: 'Cheeks', names: ['Pink', 'Orange', 'Blue', 'Yellow'] },
      { key: 'mouth', label: 'MOUTH', mobileLabel: 'Mouth', names: ['Smile', 'Playful', 'Happy', 'Surprised'] },
      { key: 'accessory', label: 'ACCESSORY', mobileLabel: 'Accessory', names: ['Purple glasses', 'Red bow', 'Mustache', 'Sunglasses'] }
    ];
  }

  function appendMascotLayer(stage, source, x, y, width, height, className) {
    var image = new Image();
    image.src = source;
    image.alt = '';
    image.draggable = false;
    image.className = 'character-layer';
    if (className) {
      image.className += ' ' + className;
    }
    image.style.left = (x / 6.8) + '%';
    image.style.top = (y / 6.8) + '%';
    image.style.width = (width / 6.8) + '%';
    image.style.height = (height / 6.8) + '%';
    stage.appendChild(image);
  }

  function syncMiniGameOptions(panel, state) {
    toArray(panel.querySelectorAll('.option')).forEach(function (button) {
      var group = button.getAttribute('data-group');
      var index = Number(button.getAttribute('data-index'));
      var isSelected = state[group] === index;
      var check = button.querySelector('.selection-check');
      button.classList.toggle('selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      if (check) {
        check.hidden = !isSelected;
      }
    });
  }

  function renderMiniMascot(stage, panel, assets, state) {
    var eye = assets.eyes[state.eyes];
    var mouth = assets.mouth[state.mouth];
    var shadow = document.createElement('div');
    stage.replaceChildren();
    shadow.className = 'character-shadow';
    stage.appendChild(shadow);
    appendMascotLayer(stage, assets.body[state.body].src, 0, 0, 680, 680, 'body-layer');
    appendMascotLayer(stage, assets.cheek[state.cheek].src, 212, 316, 90, 90, '');
    appendMascotLayer(stage, assets.cheek[state.cheek].src, 448, 316, 90, 90, '');
    appendMascotLayer(stage, eye.src, 289 + eye.x, 288 + eye.y, eye.w, eye.h, '');
    appendMascotLayer(stage, mouth.src, 316 + mouth.x, 337 + mouth.y, mouth.w, mouth.h, '');

    if (state.accessory === 0) {
      appendMascotLayer(stage, assets.accessory[0].src, 238, 180, 278, 278, '');
    }
    if (state.accessory === 1) {
      appendMascotLayer(stage, assets.accessory[1].src, 317, 405, 120, 120, '');
    }
    if (state.accessory === 2) {
      appendMascotLayer(stage, assets.accessory[2].src, 310, 305, 134, 101, '');
    }
    if (state.accessory === 3) {
      var crop = document.createElement('div');
      var image = new Image();
      crop.className = 'sunglasses-crop';
      image.src = assets.accessory[3].src;
      image.alt = '';
      image.draggable = false;
      crop.appendChild(image);
      stage.appendChild(crop);
    }

    syncMiniGameOptions(panel, state);
  }

  function buildMiniGameControls(game, panel, stage, status) {
    var assets = getMiniGameAssets();
    var groups = getMiniGameGroups();
    var initial = { body: 3, eyes: 1, cheek: 1, mouth: 2, accessory: 2 };
    var state = Object.assign({}, initial);

    function render() {
      renderMiniMascot(stage, panel, assets, state);
    }

    groups.forEach(function (group) {
      var field = document.createElement('fieldset');
      var legend = document.createElement('legend');
      var grid = document.createElement('div');
      field.className = 'option-group group-' + group.key;
      legend.textContent = group.label;
      grid.className = 'option-grid';
      field.appendChild(legend);

      assets[group.key].forEach(function (asset, index) {
        var button = document.createElement('button');
        var image = new Image();
        var check = document.createElement('span');
        button.type = 'button';
        button.className = 'option';
        button.setAttribute('data-group', group.key);
        button.setAttribute('data-index', String(index));
        button.setAttribute('aria-label', group.mobileLabel + ': ' + group.names[index]);
        button.title = group.names[index];
        image.src = asset.src;
        image.alt = '';
        image.draggable = false;

        if (group.key === 'accessory' && index === 3) {
          var thumbCrop = document.createElement('span');
          thumbCrop.className = 'thumbnail-sunglasses';
          thumbCrop.appendChild(image);
          button.appendChild(thumbCrop);
        } else {
          button.appendChild(image);
        }

        check.className = 'selection-check';
        check.textContent = '✓';
        button.appendChild(check);
        button.addEventListener('click', function () {
          if (group.key === 'accessory' && state[group.key] === index) {
            state[group.key] = -1;
          } else {
            state[group.key] = index;
          }
          render();
          if (status) {
            status.textContent = group.mobileLabel + ': ' + group.names[index];
          }
        });
        grid.appendChild(button);
      });

      field.appendChild(grid);
      panel.appendChild(field);
    });

    var reset = game.querySelector('.reset-button');
    var random = game.querySelector('.random-button');
    if (reset) {
      reset.addEventListener('click', function () {
        state = Object.assign({}, initial);
        render();
        if (status) {
          status.textContent = 'Mascot reset.';
        }
      });
    }
    if (random) {
      random.addEventListener('click', function () {
        groups.forEach(function (group) {
          state[group.key] = Math.floor(Math.random() * assets[group.key].length);
        });
        render();
        if (status) {
          status.textContent = 'New mascot generated.';
        }
      });
    }

    render();
  }

  function syncMiniGameMobileTabs(game, panel) {
    var parts = [
      { key: 'body', selector: '.group-body', label: 'Body' },
      { key: 'eyes', selector: '.group-eyes', label: 'Eyes' },
      { key: 'cheek', selector: '.group-cheek', label: 'Cheeks' },
      { key: 'mouth', selector: '.group-mouth', label: 'Mouth' },
      { key: 'accessory', selector: '.group-accessory', label: 'Accessory' }
    ];
    var isMobile = window.matchMedia('(max-width: 767px)').matches;
    var tabs = panel.querySelector('.ezpo-mobile-game-tabs');

    if (!isMobile) {
      parts.forEach(function (part) {
        var group = panel.querySelector(part.selector);
        if (group) {
          group.classList.remove('is-mobile-active-part');
          group.setAttribute('aria-hidden', 'false');
        }
      });
      return;
    }

    if (!tabs) {
      tabs = document.createElement('div');
      tabs.className = 'ezpo-mobile-game-tabs';
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Choose a part');
      panel.insertBefore(tabs, panel.querySelector('.option-group'));
    }

    function activatePart(key) {
      var activeKey = 'accessory';
      parts.forEach(function (part) {
        if (part.key === key) {
          activeKey = key;
        }
      });
      game.setAttribute('data-mobile-game-part', activeKey);
      parts.forEach(function (part) {
        var group = panel.querySelector(part.selector);
        var tab = tabs.querySelector('[data-ezpo-mobile-game-tab="' + part.key + '"]');
        var isActive = part.key === activeKey;
        if (group) {
          group.classList.toggle('is-mobile-active-part', isActive);
          group.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        }
        if (tab) {
          tab.classList.toggle('is-active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.tabIndex = isActive ? 0 : -1;
        }
      });
    }

    parts.forEach(function (part) {
      var tab = tabs.querySelector('[data-ezpo-mobile-game-tab="' + part.key + '"]');
      if (!tab) {
        tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'ezpo-mobile-game-tab';
        tab.setAttribute('data-ezpo-mobile-game-tab', part.key);
        tab.setAttribute('role', 'tab');
        tab.addEventListener('click', function (event) {
          event.preventDefault();
          activatePart(part.key);
        });
        tabs.appendChild(tab);
      }
      if (tab.textContent !== part.label) {
        tab.textContent = part.label;
      }
    });

    if (!panel.getAttribute('data-mobile-game-click-bound')) {
      panel.setAttribute('data-mobile-game-click-bound', 'true');
      panel.addEventListener('click', function (event) {
        var option = event.target.closest('.option[data-group]');
        if (option && option.getAttribute('data-group')) {
          activatePart(option.getAttribute('data-group'));
        }
      });
    }

    activatePart(game.getAttribute('data-mobile-game-part') || 'accessory');
  }

  function setupMiniGame(root) {
    var game = root.querySelector('.easify-mini-game');
    if (!game) {
      return;
    }

    var panel = game.querySelector('.customizer');
    var stage = game.querySelector('.character-stage');
    var status = game.querySelector('.game-status');
    if (!panel || !stage) {
      return;
    }

    if (panel.getAttribute('data-mini-game-ready') !== 'true') {
      panel.setAttribute('data-mini-game-ready', 'true');
      buildMiniGameControls(game, panel, stage, status);
    }
    syncMiniGameMobileTabs(game, panel);
  }

  function setupWhenNearViewport(element, markerAttribute, setup) {
    if (!element || element.getAttribute(markerAttribute) === 'true') {
      return;
    }

    element.setAttribute(markerAttribute, 'true');
    if (typeof IntersectionObserver !== 'function') {
      setup();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        observer.unobserve(entry.target);
        setup();
      });
    }, { rootMargin: '800px 0px', threshold: 0 });
    observer.observe(element);
  }

  function setupLazyHomeSections(root) {
    if (!root) {
      return;
    }

    setupWhenNearViewport(root.querySelector('[data-about-story]'), 'data-about-story-lazy-bound', function () {
      setupHomeAboutStory(root);
    });
    setupWhenNearViewport(root.querySelector('.bb-morph'), 'data-morph-story-lazy-bound', function () {
      setupHomeMorphStory(root);
    });
    setupWhenNearViewport(root.querySelector('.bb-features'), 'data-feature-story-lazy-bound', function () {
      setupHomeFeatureStory(root);
    });

    var revealRoot = null;
    if (root.matches && root.matches('[data-home-pricing-reveal]')) {
      revealRoot = root;
    } else {
      revealRoot = root.querySelector('[data-home-pricing-reveal]');
    }
    if (revealRoot) {
      var pricingSection = revealRoot.closest('.easify-home-pricing-section');
      var pricingAnchor = pricingSection && pricingSection.previousElementSibling ? pricingSection.previousElementSibling : revealRoot;
      setupWhenNearViewport(pricingAnchor, 'data-home-pricing-lazy-bound', function () {
        setupHomePricingReveal(root);
      });
    }

    setupWhenNearViewport(root.querySelector('.easify-mini-game'), 'data-mini-game-lazy-bound', function () {
      setupMiniGame(root);
    });
  }

  function refreshLazyHomeSections(root) {
    setupLazyHomeSections(root);
    if (root && root.querySelector('.easify-mini-game .customizer[data-mini-game-ready="true"]')) {
      setupMiniGame(root);
    }
  }


  function setupBackToTop(root) {
    var topButton = root.querySelector('[data-top-btn]');
    if (!topButton) {
      return;
    }

    function syncBackToTopButton() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      if (scrollTop > viewportHeight * 1.2) {
        topButton.classList.add('is-visible');
      } else {
        topButton.classList.remove('is-visible');
      }
    }

    if (topButton.getAttribute('data-top-btn-ready') !== 'true') {
      topButton.setAttribute('data-top-btn-ready', 'true');
      topButton.addEventListener('click', function () {
        var smoothScroll = window.EasifySmoothScroll;
        if (smoothScroll && typeof smoothScroll.scrollTo === 'function' && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
          smoothScroll.scrollTo(0);
          return;
        }
        window.scrollTo({ top: 0, behavior: getNativeScrollBehavior() });
      });
      window.addEventListener('scroll', syncBackToTopButton, { passive: true });
      window.addEventListener('resize', syncBackToTopButton);
    }

    syncBackToTopButton();
  }

  function initialize() {
    bindHomeStoryLifecycle();
    setupSmoothWheelScroll();
    setupSiteMenus(document);
    var roots = getRoots();
    roots.forEach(function (root) {
      setupMascotCta(root);
      setupHomeGameVisibility(root);
      setupDemoChoiceGroups(root);
      setupHomeViewportExtras(root);
      setupLazyHomeSections(root);
      setupRangeInputs(root);
      setupPricingCalculators(root);
      setupPricingFaq(root);
      setupTestimonials(root);
      setupBackToTop(root);
    });
    setupSiteMotion(document);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      requestHomeStorySyncs();
      getRoots().forEach(function (root) {
        setupHomeViewportExtras(root);
        refreshLazyHomeSections(root);
        setupBackToTop(root);
      });
    }, 80);
  });

  document.addEventListener('shopify:section:load', function (event) {
    requestHomeStorySyncs();
    var sectionRoot = event.target ? event.target.querySelector('[data-easify-final]') : null;
    if (!sectionRoot) {
      initialize();
      return;
    }
    setupDemoChoiceGroups(sectionRoot);
    setupMascotCta(sectionRoot);
    setupHomeGameVisibility(sectionRoot);
    setupHomeViewportExtras(sectionRoot);
    setupLazyHomeSections(sectionRoot);
    setupSiteMenus(sectionRoot);
    setupRangeInputs(sectionRoot);
    setupPricingCalculators(sectionRoot);
    setupPricingFaq(sectionRoot);
    setupTestimonials(sectionRoot);
    setupBackToTop(sectionRoot);
    setupSiteMotion(event.target || sectionRoot);
  });

  document.addEventListener('shopify:section:reorder', function () {
    getRoots().forEach(function (root) {
      setupHomePricingReveal(root);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}());
