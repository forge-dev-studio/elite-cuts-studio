/* ============================================================
   ELITE CUTS STUDIO - SITE JS
   Scroll animations, parallax, calendar, interactive effects
   ============================================================ */

(function () {
  "use strict";

  // ---- PRELOADER ----
  var preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        preloader.classList.add("hidden");
        document.body.style.overflow = "";
        initScrollAnimations();
      }, 1400);
    });
    document.body.style.overflow = "hidden";
  }

  // ---- MOBILE NAV ----
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- HEADER SCROLL STATE ----
  var header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 60);
    }, { passive: true });
  }

  // ---- SCROLL ANIMATIONS (IntersectionObserver) ----
  function initScrollAnimations() {
    var items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
          setTimeout(function () {
            entry.target.classList.add("is-visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  // Fallback: if no preloader, init scroll animations immediately
  if (!preloader) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initScrollAnimations);
    } else {
      initScrollAnimations();
    }
  }

  // ---- PARALLAX EFFECT ----
  var parallaxElements = document.querySelectorAll("[data-parallax]");
  if (parallaxElements.length) {
    window.addEventListener("scroll", function () {
      var scrollY = window.scrollY;
      parallaxElements.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax") || "0.3");
        var rect = el.parentElement.getBoundingClientRect();
        var offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
        el.style.transform = "translateY(" + offset * 0.15 + "px) scale(1.1)";
      });
    }, { passive: true });
  }

  // ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var headerH = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  // ---- TILT EFFECT ON MEDIA CARDS ----
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        "perspective(600px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg) scale(1.02)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)";
    });
  });

  // ============================================================
  // SERVICE PILL SELECTION
  // ============================================================
  var servicePills = document.getElementById("servicePills");
  var selectedService = "Classic Cut";

  if (servicePills) {
    servicePills.addEventListener("click", function (e) {
      var pill = e.target.closest(".service-pill");
      if (!pill) return;
      servicePills.querySelectorAll(".service-pill").forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
      selectedService = pill.getAttribute("data-service");
      updateBookingSummary();
    });
  }

  // ============================================================
  // BOOKING CALENDAR
  // ============================================================
  var calendarEl = document.getElementById("bookingCalendar");
  if (calendarEl) {
    initCalendar();
  }

  var selectedDate = null;
  var selectedTime = null;

  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function initCalendar() {
    var now = new Date();
    var currentMonth = now.getMonth();
    var currentYear = now.getFullYear();

    // Closed days: Sunday (0), Tuesday (2), Thursday (4)
    var closedDays = [0, 2, 4];

    var calendarTitle = calendarEl.querySelector(".calendar-month-title");
    var prevBtn = calendarEl.querySelector(".cal-prev");
    var nextBtn = calendarEl.querySelector(".cal-next");
    var daysContainer = calendarEl.querySelector(".calendar-days");
    var selectedDisplay = calendarEl.querySelector(".selected-date");
    var timeSlotsContainer = calendarEl.querySelector(".time-slots");
    var bookBtn = calendarEl.querySelector(".cal-book-btn");

    if (prevBtn) prevBtn.addEventListener("click", function () { changeMonth(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { changeMonth(1); });

    if (bookBtn) {
      bookBtn.addEventListener("click", function () {
        if (selectedDate && selectedTime && selectedService) {
          var dateStr = dayNames[selectedDate.getDay()] + ", " +
            monthNames[selectedDate.getMonth()] + " " + selectedDate.getDate() + ", " + selectedDate.getFullYear();
          alert(
            "Booking Request Submitted!\n\n" +
            "Service: " + selectedService + "\n" +
            "Date: " + dateStr + "\n" +
            "Time: " + selectedTime + "\n\n" +
            "Elite Cuts Studio will confirm your appointment shortly."
          );
        }
      });
    }

    function changeMonth(delta) {
      currentMonth += delta;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    }

    function renderCalendar() {
      if (calendarTitle) {
        calendarTitle.textContent = monthNames[currentMonth] + " " + currentYear;
      }

      var firstDay = new Date(currentYear, currentMonth, 1).getDay();
      var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      var today = new Date();

      var html = "";

      for (var i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(currentYear, currentMonth, d);
        var dayOfWeek = date.getDay();
        var isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var isClosed = closedDays.indexOf(dayOfWeek) !== -1;
        var isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        var isSelected = selectedDate &&
          d === selectedDate.getDate() &&
          currentMonth === selectedDate.getMonth() &&
          currentYear === selectedDate.getFullYear();

        var classes = "calendar-day";
        if (isPast || isClosed) classes += " disabled";
        if (isToday && !isClosed && !isPast) classes += " today";
        if (isSelected) classes += " selected";

        html += '<div class="' + classes + '" data-day="' + d + '">' + d + '</div>';
      }

      if (daysContainer) {
        daysContainer.innerHTML = html;
        daysContainer.querySelectorAll(".calendar-day:not(.disabled):not(.empty)").forEach(function (dayEl) {
          dayEl.addEventListener("click", function () {
            var day = parseInt(this.getAttribute("data-day"), 10);
            selectedDate = new Date(currentYear, currentMonth, day);
            selectedTime = null;
            renderCalendar();
            renderTimeSlots();
            updateSelectedDisplay();
            updateBookingSummary();
          });
        });
      }
    }

    function renderTimeSlots() {
      if (!timeSlotsContainer) return;

      if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p class="time-slots-placeholder">Select a date to see available times</p>';
        return;
      }

      var dayOfWeek = selectedDate.getDay();
      var slots = [];

      if (dayOfWeek === 6) {
        // Saturday: 7am - 2pm
        for (var h = 7; h < 14; h++) {
          slots.push(formatHour(h, 0));
          if (h < 13) slots.push(formatHour(h, 30));
        }
      } else {
        // Mon, Wed, Fri: 8am - 8pm
        for (var h2 = 8; h2 < 20; h2++) {
          slots.push(formatHour(h2, 0));
          slots.push(formatHour(h2, 30));
        }
      }

      var html = "";
      slots.forEach(function (slot) {
        var isSelected = selectedTime === slot;
        html += '<div class="time-slot' + (isSelected ? ' selected' : '') + '" data-time="' + slot + '">' + slot + '</div>';
      });

      timeSlotsContainer.innerHTML = html;

      timeSlotsContainer.querySelectorAll(".time-slot").forEach(function (slotEl) {
        slotEl.addEventListener("click", function () {
          selectedTime = this.getAttribute("data-time");
          renderTimeSlots();
          updateSelectedDisplay();
          updateBookingSummary();
        });
      });
    }

    function formatHour(h, m) {
      var ampm = h >= 12 ? "PM" : "AM";
      var hour12 = h % 12 || 12;
      var min = m === 0 ? "00" : String(m);
      return hour12 + ":" + min + " " + ampm;
    }

    function updateSelectedDisplay() {
      if (!selectedDisplay) return;
      if (selectedDate) {
        var dateStr = dayNames[selectedDate.getDay()] + ", " +
          monthNames[selectedDate.getMonth()] + " " + selectedDate.getDate();
        var timeStr = selectedTime ? " at <strong>" + selectedTime + "</strong>" : " &mdash; pick a time below";
        selectedDisplay.innerHTML = "<strong>" + dateStr + "</strong>" + timeStr;
      } else {
        selectedDisplay.innerHTML = "No date selected";
      }

      if (bookBtn) {
        if (selectedDate && selectedTime) {
          bookBtn.removeAttribute("disabled");
          bookBtn.classList.add("ready");
        } else {
          bookBtn.setAttribute("disabled", "");
          bookBtn.classList.remove("ready");
        }
      }
    }

    renderCalendar();
    renderTimeSlots();
    updateSelectedDisplay();
  }

  // ---- BOOKING SUMMARY UPDATE ----
  function updateBookingSummary() {
    var summary = document.getElementById("bookingSummary");
    var summaryText = document.getElementById("summaryText");
    if (!summary || !summaryText) return;

    if (selectedDate && selectedTime && selectedService) {
      var dateStr = dayNames[selectedDate.getDay()] + ", " +
        monthNames[selectedDate.getMonth()] + " " + selectedDate.getDate() + ", " + selectedDate.getFullYear();
      summaryText.innerHTML =
        "<strong>Service:</strong> " + selectedService + "<br>" +
        "<strong>Date:</strong> " + dateStr + "<br>" +
        "<strong>Time:</strong> " + selectedTime;
      summary.classList.add("visible");
    } else if (selectedDate || selectedService) {
      var parts = [];
      if (selectedService) parts.push("<strong>Service:</strong> " + selectedService);
      if (selectedDate) {
        var ds = dayNames[selectedDate.getDay()] + ", " +
          monthNames[selectedDate.getMonth()] + " " + selectedDate.getDate();
        parts.push("<strong>Date:</strong> " + ds);
      }
      if (selectedTime) parts.push("<strong>Time:</strong> " + selectedTime);
      summaryText.innerHTML = parts.join("<br>") + "<br><em>Complete all selections to confirm.</em>";
      summary.classList.add("visible");
    } else {
      summary.classList.remove("visible");
    }
  }

  // ---- CONTACT FORM ----
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = "Sending...";
      btn.disabled = true;

      var firstName = (document.getElementById("firstName") || {}).value || "";
      var lastName = (document.getElementById("lastName") || {}).value || "";
      var email = (document.getElementById("email") || {}).value || "";
      var phone = (document.getElementById("phone") || {}).value || "";
      var message = (document.getElementById("message") || {}).value || "";

      var msg = 'New Contact from EliteCutsStudio.com\n---\nName: ' + firstName + ' ' + lastName + '\nEmail: ' + email + '\nPhone: ' + (phone || 'N/A') + '\nMessage: ' + message;
      window.open('https://wa.me/14702905379?text=' + encodeURIComponent(msg), '_blank');

      btn.textContent = "Message Sent!";
      btn.style.background = "#27ae60";
      contactForm.reset();
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = "";
        btn.disabled = false;
      }, 3000);
    });
  }

})();
