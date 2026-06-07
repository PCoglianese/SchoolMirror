/* MagicMirror²
 * Node Helper: Weekly Calendar
 * Reuses CalendarFetcher from default calendar module.
 */
const NodeHelper = require("node_helper");
const CalendarFetcher = require("../default/calendar/calendarfetcher.js");
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.log("Starting node helper for: " + this.name);
    this.fetchers = [];
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "ADD_CALENDAR") {
      Log.log("weeklycalendar node_helper: received ADD_CALENDAR for URL:", payload.url);
      this.createFetcher(payload.url, payload.fetchInterval, payload.excludedEvents, payload.maximumEntries, payload.maximumNumberOfDays, payload.auth, payload.broadcastPastEvents, payload.selfSignedCert, payload.id);
    }
  },

  createFetcher: function (url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth, broadcastPastEvents, selfSignedCert, identifier) {
    try {
      new URL(url);
    } catch (error) {
      Log.error("Calendar Error. Malformed calendar url: ", url, error);
      this.sendSocketNotification("CALENDAR_ERROR", { error_type: "MODULE_ERROR_MALFORMED_URL" });
      return;
    }

    let fetcher;
    if (typeof this.fetchers[identifier + url] === "undefined") {
      Log.log("Create new calendarfetcher for url: " + url + " - Interval: " + fetchInterval);
      fetcher = new CalendarFetcher(url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth, broadcastPastEvents, selfSignedCert);

      fetcher.onReceive((fetcher) => {
        this.broadcastEvents(fetcher, identifier);
      });

      fetcher.onError((fetcher, error) => {
        Log.error("Calendar Error. Could not fetch calendar: ", fetcher.url(), error);
        let error_type = NodeHelper.checkFetchError(error);
        this.sendSocketNotification("CALENDAR_ERROR", {
          id: identifier,
          error_type,
        });
      });

      this.fetchers[identifier + url] = fetcher;
    } else {
      Log.log("Use existing calendarfetcher for url: " + url);
      fetcher = this.fetchers[identifier + url];
      fetcher.broadcastEvents();
    }

    fetcher.startFetch();
  },

  broadcastEvents: function (fetcher, identifier) {
    this.sendSocketNotification("CALENDAR_EVENTS", {
      id: identifier,
      url: fetcher.url(),
      events: fetcher.events(),
    });
  },
});
