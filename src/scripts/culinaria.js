/* Culinária site interactions.
 *
 * Behaviours:
 * 1. Mobile navigation toggle (.menu-button -> .nav.menu-open, over-right panel)
 * 2. Scroll-reveal for .fade-up elements (IntersectionObserver)
 * 3. Form handling: the newsletter, contact and footer forms read their mode
 *    from `data-submit`. "demo" (the default when `newsletter.action` is
 *    empty) swaps the submit button to its data-wait text and shows the inline
 *    success message without sending anything. "ajax" fetches the provider
 *    endpoint and shows the inline success or error panel. "native" submits
 *    normally, as does any form with an action and no mode (site search).
 *    Every mode first checks the off-screen honeypot and silently drops a
 *    submission that filled it in.
 * 4. In-page anchor glide (rAF easeInOutCubic).
 * 5. Sticky header hide-on-scroll (.nav.nav-hidden).
 * 6. Theme toggle ([data-theme-toggle] -> html.dark, persisted in localStorage).
 */
(function () {
  // 0. Theme (dark / light) ------------------------------------------------
  // The initial class is set by the anti-FOUC script in BaseLayout, so here
  // we only sync the buttons and handle user toggles. A stored choice wins;
  // otherwise the OS `prefers-color-scheme` applies (and keeps applying).
  var THEME_KEY = "theme";
  var themeMedia = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function currentTheme() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  function syncThemeButtons() {
    var dark = currentTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(dark));
    });
  }

  function applyTheme(theme, persist) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }
    syncThemeButtons();
  }

  syncThemeButtons();
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  });
  if (themeMedia) {
    var onSystemChange = function (event) {
      var stored = null;
      try {
        stored = localStorage.getItem(THEME_KEY);
      } catch (e) {}
      if (stored !== "dark" && stored !== "light") {
        applyTheme(event.matches ? "dark" : "light", false);
      }
    };
    if (themeMedia.addEventListener) themeMedia.addEventListener("change", onSystemChange);
  }

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Mobile navigation -----------------------------------------------
  var nav = document.querySelector(".nav.c-nav");
  var menuButton = document.querySelector(".menu-button");
  var overlay = document.querySelector(".menu-overlay");

  function setMenuOpen(open) {
    if (!nav || !menuButton) return;
    nav.classList.toggle("menu-open", open);
    menuButton.classList.toggle("c--open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("has-open-menu", open);
  }

  if (menuButton) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.addEventListener("click", function () {
      setMenuOpen(!nav.classList.contains("menu-open"));
    });
    menuButton.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setMenuOpen(!nav.classList.contains("menu-open"));
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }
  if (overlay) {
    overlay.addEventListener("click", function () {
      setMenuOpen(false);
    });
  }

  // 2. Scroll-reveal ------------------------------------------------------
  var fadeUps = document.querySelectorAll(".fade-up");
  if (fadeUps.length > 0 && !reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-anim");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    fadeUps.forEach(function (el) {
      observer.observe(el);
    });
  }

  // 3. Forms (newsletter demo + ajax, contact, footer) --------------------
  //    The mode is published on the form by NewsletterSignup.astro as
  //    data-submit: "demo" confirms locally, "native" posts and is left alone,
  //    "ajax" fetches and confirms inline. Forms with no data-submit fall back
  //    to the old rule, so search (which has an action) still submits
  //    natively and any ad-hoc form stays a local demo.
  document.querySelectorAll(".c-form form").forEach(function (form) {
    var mode = form.getAttribute("data-submit");
    if (!mode) mode = form.getAttribute("action") ? "native" : "demo";

    // Swap the submit button to its data-wait text for the duration, so the
    // visitor gets feedback during the fake or the real round trip.
    function beginWait() {
      var submit = form.querySelector(
        ':scope input[type="submit"], :scope button[type="submit"]',
      );
      if (!submit) return null;
      var original = "value" in submit ? submit.value : submit.textContent;
      var wait = submit.getAttribute("data-wait");
      if (wait) {
        if ("value" in submit) submit.value = wait;
        else submit.textContent = wait;
      }
      submit.disabled = true;
      return { submit: submit, original: original };
    }

    function endWait(state) {
      if (!state || !state.submit) return;
      if ("value" in state.submit && state.original !== null) {
        state.submit.value = state.original;
      } else if (state.original !== null) {
        state.submit.textContent = state.original;
      }
      state.submit.disabled = false;
    }

    // Show the inline success or error panel and reset the form. Shared by
    // both modes so they cannot drift apart.
    function finish(ok, state) {
      var container = form.closest(".c-form");
      var panel = container
        ? container.querySelector(ok ? ".c-form-done" : ".c-form-fail")
        : null;
      form.style.display = "none";
      if (panel) {
        panel.style.display = "block";
        panel.setAttribute("tabindex", "-1");
        panel.focus({ preventScroll: true });
      }
      form.reset();
      endWait(state);
    }

    form.addEventListener("submit", function (event) {
      // Anti-spam honeypot, checked first and in every mode. A human never
      // fills the off-screen field, so a filled one means a bot. In "native"
      // mode this is the only thing standing between the bot and your
      // provider, which is why the check lives inside the handler rather than
      // behind the early return below.
      var trap = form.querySelector(".form-hp input");
      if (trap && trap.value) {
        event.preventDefault();
        trap.value = "";
        return;
      }

      // "native" posts for real, so let the browser do it untouched.
      if (mode === "native") return;

      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var state = beginWait();

      if (mode === "ajax") {
        var url = form.getAttribute("action");
        window
          .fetch(url, { method: form.getAttribute("method") || "post", body: new FormData(form) })
          .then(function (response) {
            // Providers disagree on the response body, and a JSONP endpoint
            // returns JavaScript rather than JSON, so only the status is
            // treated as meaningful.
            finish(response.ok, state);
            if (response.ok) {
              var successUrl = form.getAttribute("data-success-url");
              if (successUrl) window.location.href = successUrl;
            }
          })
          .catch(function () {
            // Network failure or a blocked cross-origin request: the provider
            // did not accept the signup, so show the error panel rather than
            // a false confirmation.
            finish(false, state);
          });
        return;
      }

      // Demo mode: nothing is sent anywhere, so confirm after a beat.
      window.setTimeout(function () {
        finish(true, state);
      }, reduceMotion ? 0 : 500);
    });
  });
  // 4. In-page anchor glide -------------------------
  // Native CSS smooth-scroll duration is UA-decided and feels rushed on
  // long jumps; the legacy runtime glides for roughly a second with an
  // ease-out curve, so drive it explicitly with rAF instead.
  var activeGlide = null;
  var pendingRestore = null;

  function cancelGlide() {
    if (activeGlide !== null) {
      window.cancelAnimationFrame(activeGlide);
      activeGlide = null;
    }
    if (pendingRestore !== null) {
      pendingRestore();
      pendingRestore = null;
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function glideTo(top, hash) {
    // Cancel any in-flight glide BEFORE parking scrollBehavior: the cancel
    // restores the parked value, so doing it after would immediately undo
    // the parking and let the CSS smooth scroll compound on top of every
    // tween step (swimmy motion).
    cancelGlide();
    var startY = window.scrollY || window.pageYOffset;
    var distance = top - startY;
    if (Math.abs(distance) < 4) {
      if (hash) history.pushState(null, "", hash);
      return;
    }
    // The CSS `scroll-behavior: smooth` fallback would compound with the
    // manual tween, so park it while the glide runs.
    var root = document.documentElement;
    var prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    function restore() {
      root.style.scrollBehavior = prevBehavior;
      pendingRestore = null;
    }
    pendingRestore = restore;
    // Deliberately unhurried: ~1s minimum so short jumps still read as a
    // glide rather than a snap.
    var duration = Math.min(1600, Math.max(950, Math.abs(distance) * 1.1));
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) {
        activeGlide = window.requestAnimationFrame(frame);
      } else {
        activeGlide = null;
        restore();
        if (hash) history.pushState(null, "", hash);
      }
    }
    activeGlide = window.requestAnimationFrame(frame);
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var hash = link.getAttribute("href");
    var id = hash.length > 1 ? decodeURIComponent(hash.slice(1)) : "";
    var target = id ? document.getElementById(id) : null;
    if (id && !target) return;
    event.preventDefault();
    cancelGlide();
    var top = target ? target.getBoundingClientRect().top + (window.scrollY || 0) : 0;
    if (reduceMotion) {
      window.scrollTo(0, top);
      if (hash.length > 1) history.pushState(null, "", hash);
      return;
    }
    glideTo(top, hash.length > 1 ? hash : null);
  });

  ["wheel", "touchmove"].forEach(function (evt) {
    document.addEventListener(evt, cancelGlide, { passive: true });
  });

  // 5. Sticky header hide-on-scroll -------------------------------------
  // Esconde ao descer, mostra ao subir. Não esconde com o menu aberto.
  var lastY = window.scrollY || window.pageYOffset;
  var ticking = false;
  var HIDE_AFTER = 160;
  var DELTA = 8;

  function updateNavVisibility() {
    ticking = false;
    if (!nav) return;
    if (nav.classList.contains("menu-open")) {
      nav.classList.remove("nav-hidden");
      lastY = window.scrollY || window.pageYOffset;
      return;
    }
    var currentY = window.scrollY || window.pageYOffset;
    if (currentY <= HIDE_AFTER) {
      nav.classList.remove("nav-hidden");
    } else if (currentY > lastY + DELTA) {
      nav.classList.add("nav-hidden");
    } else if (currentY < lastY - DELTA) {
      nav.classList.remove("nav-hidden");
    }
    lastY = currentY;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateNavVisibility);
      }
    },
    { passive: true },
  );
})();
