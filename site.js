(function () {
  function find(selector) {
    return document.querySelector(selector);
  }

  function initContactSpinner() {
    var spinner = find("[data-contact-spinner]");

    if (!spinner) {
      return;
    }

    var contactLink = find('.navbar-nav a[href="contact.htm"]');
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isNavigating = false;

    function goToContact(event) {
      if (event) {
        event.preventDefault();
      }

      if (isNavigating) {
        return;
      }

      isNavigating = true;

      if (!contactLink || reduceMotion) {
        window.location.href = spinner.href;
        return;
      }

      var spinnerBox = spinner.getBoundingClientRect();
      var contactBox = contactLink.getBoundingClientRect();

      if (!contactBox.width || !contactBox.height) {
        window.location.href = spinner.href;
        return;
      }

      spinner.style.setProperty("--contact-launch-x", (contactBox.left + contactBox.width / 2 - spinnerBox.left - spinnerBox.width / 2) + "px");
      spinner.style.setProperty("--contact-launch-y", (contactBox.top + contactBox.height / 2 - spinnerBox.top - spinnerBox.height / 2) + "px");
      contactLink.classList.add("contact-link-target");
      spinner.classList.add("is-launching");

      window.setTimeout(function () {
        document.body.classList.add("page-leaving");
      }, 500);

      window.setTimeout(function () {
        window.location.href = spinner.href;
      }, 760);
    }

    spinner.addEventListener("mouseenter", goToContact);
    spinner.addEventListener("click", goToContact);
  }

  function initContactMusic() {
    var button = find("[data-contact-music]");
    var label = find("[data-contact-music-label]");
    var audio = find("[data-contact-audio]");

    if (!button || !label || !audio) {
      return;
    }

    audio.volume = 0.45;

    function setPlaying(isPlaying) {
      button.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      label.textContent = isPlaying ? "Pause MIDI mood" : "Play MIDI mood";
      document.body.classList.toggle("contact-music-playing", isPlaying);
    }

    function showTemporaryLabel(text) {
      label.textContent = text;
      window.setTimeout(function () {
        if (audio.paused) {
          label.textContent = "Play MIDI mood";
        }
      }, 1600);
    }

    function waitForGesture() {
      function resume(event) {
        document.removeEventListener("pointerdown", resume);
        document.removeEventListener("keydown", resume);

        if (button.contains(event.target)) {
          return;
        }

        startMusic(false);
      }

      document.addEventListener("pointerdown", resume);
      document.addEventListener("keydown", resume);
    }

    function startMusic(isAutoplay) {
      var playAttempt;

      label.textContent = "Starting MIDI mood";
      button.setAttribute("aria-pressed", "true");
      playAttempt = audio.play();

      if (!playAttempt || !playAttempt.then) {
        window.setTimeout(function () {
          setPlaying(!audio.paused);
        }, 100);
        return;
      }

      playAttempt.then(function () {
        setPlaying(true);
      }).catch(function () {
        setPlaying(false);

        if (isAutoplay) {
          waitForGesture();
          return;
        }

        showTemporaryLabel("Audio blocked");
      });
    }

    audio.addEventListener("playing", function () {
      setPlaying(true);
    });

    audio.addEventListener("pause", function () {
      setPlaying(false);
    });

    button.addEventListener("click", function () {
      if (audio.paused) {
        startMusic(false);
        return;
      }

      audio.pause();
    });

    window.setTimeout(function () {
      startMusic(true);
    }, 300);

    window.addEventListener("pagehide", function () {
      audio.pause();
    });
  }

  function initLinkedInCountdown() {
    var link = find(".linkedin-flyout");
    var countdown = find("[data-linkedin-countdown]");
    var transitionBurst = find("[data-linkedin-transition-burst]");
    var audio = find("[data-contact-audio]");
    var isRedirecting = false;

    if (!link || !countdown) {
      return;
    }

    link.addEventListener("click", function (event) {
      var remaining = 5;
      var timer;

      event.preventDefault();

      if (isRedirecting) {
        return;
      }

      isRedirecting = true;
      link.classList.add("is-counting-down");
      countdown.innerHTML = '<span class="linkedin-countdown-number">' + remaining + '</span>';

      timer = window.setInterval(function () {
        remaining -= 1;

        if (remaining === 0) {
          window.clearInterval(timer);
          countdown.innerHTML = '<span class="linkedin-countdown-number">0</span>';
          link.classList.add("is-exploding");

          if (transitionBurst) {
            transitionBurst.classList.add("is-active");
          }

          window.setTimeout(function () {
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
            }

            window.location.href = link.href;
          }, 1250);
          return;
        }

        countdown.innerHTML = '<span class="linkedin-countdown-number">' + remaining + '</span>';
      }, 1000);
    });
  }

  function initLinkedInTravel() {
    var link = find(".linkedin-flyout");
    var soundbar = find(".contact-soundbar");
    var container = soundbar ? soundbar.closest(".container") : null;
    var form = container ? container.querySelector("form") : null;

    if (!link) {
      return;
    }

    if (!form) {
      link.classList.add("is-ready");
      return;
    }

    function updateTravel() {
      if (window.matchMedia && window.matchMedia("(max-width: 575.98px)").matches) {
        link.classList.add("is-ready");
        return;
      }

      var parent = link.offsetParent;

      if (!parent) {
        return;
      }

      var parentBox = parent.getBoundingClientRect();
      var formBox = form.getBoundingClientRect();
      var finalIconHalfWidth = link.offsetWidth * 0.85;
      var linkCenter = parentBox.left + link.offsetLeft + link.offsetWidth / 2;
      var travel = Math.max(0, Math.round(formBox.right - linkCenter - finalIconHalfWidth));

      link.style.setProperty("--linkedin-travel-x", travel + "px");
      link.classList.add("is-ready");
    }

    updateTravel();
    window.addEventListener("resize", updateTravel);
    window.addEventListener("load", updateTravel);
    window.setTimeout(updateTravel, 300);
  }

  function initLinkTransitions() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      var burst;
      var href;

      if (!link || link.classList.contains("linkedin-flyout")) {
        return;
      }

      href = link.getAttribute("href");

      if (!href || href === "#" || href.charAt(0) === "#" || link.hasAttribute("download")) {
        return;
      }

      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      event.preventDefault();

      burst = document.createElement("span");
      burst.className = "page-link-burst";
      burst.style.setProperty("--link-burst-x", event.clientX + "px");
      burst.style.setProperty("--link-burst-y", event.clientY + "px");
      document.body.appendChild(burst);

      window.requestAnimationFrame(function () {
        burst.classList.add("is-active");
      });

      window.setTimeout(function () {
        if (link.target === "_blank") {
          window.open(link.href, "_blank", "noopener");
          burst.remove();
          return;
        }

        window.location.href = link.href;
      }, 620);
    });
  }

  function runYellowBurst(x, y, callback) {
    var burst = document.createElement("span");

    burst.className = "page-link-burst";
    burst.style.setProperty("--link-burst-x", x + "px");
    burst.style.setProperty("--link-burst-y", y + "px");
    document.body.appendChild(burst);

    window.requestAnimationFrame(function () {
      burst.classList.add("is-active");
    });

    window.setTimeout(function () {
      callback();
    }, 620);
  }

  function initFormTransitions() {
    var form = find('form[action="https://formspree.io/f/mrgngokp"]');
    var isSubmitting = false;

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      var submitButton = form.querySelector('[type="submit"]');
      var buttonBox;
      var x;
      var y;

      if (isSubmitting) {
        return;
      }

      event.preventDefault();
      isSubmitting = true;

      if (submitButton) {
        buttonBox = submitButton.getBoundingClientRect();
        x = buttonBox.left + buttonBox.width / 2;
        y = buttonBox.top + buttonBox.height / 2;
      } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }

      runYellowBurst(x, y, function () {
        form.submit();
      });
    });
  }

  initContactSpinner();
  initContactMusic();
  initLinkedInTravel();
  initLinkedInCountdown();
  initLinkTransitions();
  initFormTransitions();
}());
