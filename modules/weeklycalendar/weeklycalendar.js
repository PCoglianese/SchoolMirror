/* MagicMirror²
 * Module: Weekly Calendar (weeklycalendar)
 * Scaffolding module that shows two-week (current + next) calendar view.
 */
Module.register("weeklycalendar", {
  defaults: {
    calendars: [],
    fetchInterval: 10 * 60 * 1000, // 10 minutes
    maximumEntries: 100,
    maximumNumberOfDays: 365,
    showWeekends: true,
    timeRange: { start: "00:00", end: "23:59" },
  },

  getStyles: function () {
    return ["weeklycalendar.css", "font-awesome.css"];
  },

  getScripts: function () {
    return ["moment.js"];
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.calendarData = {};
    this.loaded = false;

    // Register calendars with node_helper and store calendar metadata
    this.calendarMeta = {};
    if (this.config.calendars && this.config.calendars.length > 0) {
      this.config.calendars.forEach((calendar) => {
        calendar.url = calendar.url.replace("webcal://", "http://");
        const calendarConfig = {
          excludedEvents: calendar.excludedEvents || [],
          maximumEntries: calendar.maximumEntries || this.config.maximumEntries,
          maximumNumberOfDays: calendar.maximumNumberOfDays || this.config.maximumNumberOfDays,
          fetchInterval: calendar.fetchInterval || this.config.fetchInterval,
          broadcastPastEvents: calendar.broadcastPastEvents || false,
          selfSignedCert: calendar.selfSignedCert || false,
        };

        // keep metadata like name/color for rendering
        this.calendarMeta[calendar.url] = {
          name: calendar.name || calendar.url,
          color: calendar.color || null,
        };

        this.addCalendar(calendar.url, calendar.auth, calendarConfig);
      });
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CALENDAR_EVENTS") {
      // Accept events destined for this module id or broadcasted without id
      if (!payload.id || payload.id === this.identifier) {
        Log.log("weeklycalendar: received CALENDAR_EVENTS for", payload.url);
        this.calendarData[payload.url] = payload.events;
        this.loaded = true;
        this.updateDom();
      }
    } else if (notification === "CALENDAR_ERROR") {
      if (!payload.id || payload.id === this.identifier) {
        Log.error("weeklycalendar: Calendar error", payload);
      }
    }
  },

  addCalendar: function (url, auth, calendarConfig) {
    const payload = {
      url: url,
      auth: auth,
      excludedEvents: calendarConfig.excludedEvents,
      fetchInterval: calendarConfig.fetchInterval,
      maximumEntries: calendarConfig.maximumEntries,
      maximumNumberOfDays: calendarConfig.maximumNumberOfDays,
      broadcastPastEvents: calendarConfig.broadcastPastEvents,
      selfSignedCert: calendarConfig.selfSignedCert,
      id: this.identifier,
    };
    Log.log("weeklycalendar: sending ADD_CALENDAR for", url, "id:", this.identifier);
    this.sendSocketNotification("ADD_CALENDAR", payload);
  },

  // Build a simple two-week grid and populate events.
  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "weeklycalendar";

    if (!this.loaded) {
      wrapper.innerHTML = "<em>Loading calendar...</em>";
      return wrapper;
    }

    const container = document.createElement('div');
    container.className = 'weeks';

    const startOfWeek = moment().startOf('week');

    // Build a map of days for two weeks
    const days = [];
    for (let i = 0; i < 14; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      if (!this.config.showWeekends && (day.day() === 0 || day.day() === 6)) {
        days.push(null); // placeholder for spacing
      } else {
        days.push({ date: day, events: [] });
      }
    }

    // collect events from all calendars into days
    for (const calendarUrl in this.calendarData) {
      const events = this.calendarData[calendarUrl];
      const color = this.calendarMeta[calendarUrl] ? this.calendarMeta[calendarUrl].color : null;
      for (const i in events) {
        const ev = events[i];
        const start = moment(Number(ev.startDate));
        for (let d = 0; d < days.length; d++) {
          const dayObj = days[d];
          if (!dayObj) continue;
          if (start.isSame(dayObj.date, 'day')) {
            const item = Object.assign({}, ev);
            item._calendar = calendarUrl;
            item._color = color;
            dayObj.events.push(item);
            break;
          }
        }
      }
    }

    // Create two week containers (each with 7 slots)
    for (let w = 0; w < 2; w++) {
      const weekEl = document.createElement('div');
      weekEl.className = 'week';

      for (let d = 0; d < 7; d++) {
        const dayIndex = w * 7 + d;
        const dayObj = days[dayIndex];

        if (!dayObj) {
          const spacer = document.createElement('div');
          spacer.className = 'day spacer';
          weekEl.appendChild(spacer);
          continue;
        }

        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        if (dayObj.date.isSame(moment(), 'day')) {
          dayEl.classList.add('today');
        }

        const header = document.createElement('div');
        header.className = 'dayHeader';
  header.innerText = dayObj.date.format('dddd, MMM D');
        dayEl.appendChild(header);

        const eventsEl = document.createElement('div');
        eventsEl.className = 'events';

        if (dayObj.events.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'empty';
          empty.innerText = '-';
          eventsEl.appendChild(empty);
        } else {
          dayObj.events.forEach((event) => {
            const ev = document.createElement('div');
            ev.className = 'event';

            const time = document.createElement('div');
            time.className = 'eventTime';
            const start = moment(Number(event.startDate));
            const end = event.endDate ? moment(Number(event.endDate)) : null;
            if (event.fullDayEvent) {
              time.innerText = 'All day';
            } else {
              // 12-hour format with AM/PM
              time.innerText = start.format('h:mm A') + (end ? ' - ' + end.format('h:mm A') : '');
            }

            const title = document.createElement('div');
            title.className = 'eventTitle';
            title.innerText = event.title || event.summary || '(no title)';

            ev.appendChild(time);
            ev.appendChild(title);
            eventsEl.appendChild(ev);
          });
        }

        dayEl.appendChild(eventsEl);
        weekEl.appendChild(dayEl);
      }

      container.appendChild(weekEl);
    }

    wrapper.appendChild(container);
    return wrapper;
  },
});
