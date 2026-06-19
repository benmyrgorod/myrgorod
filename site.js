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
      countdown.textContent = remaining;

      timer = window.setInterval(function () {
        remaining -= 1;

        if (remaining === 0) {
          window.clearInterval(timer);
          countdown.textContent = "0";
          link.classList.add("is-exploding");

          if (transitionBurst) {
            transitionBurst.classList.add("is-active");
          }

          window.setTimeout(function () {
            window.location.href = link.href;
          }, 1250);
          return;
        }

        countdown.textContent = remaining;
      }, 1000);
    });
  }

  function initLinkedInTravel() {
    var link = find(".linkedin-flyout");
    var soundbar = find(".contact-soundbar");
    var form = soundbar && soundbar.parentElement ? soundbar.parentElement.querySelector("form") : null;

    if (!link || !form) {
      return;
    }

    function updateTravel() {
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

  initContactSpinner();
  initContactMusic();
  initLinkedInTravel();
  initLinkedInCountdown();
}());
