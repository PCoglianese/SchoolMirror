# MMM-WeeklyCalendar

Simple two-week calendar view for MagicMirror that shows current and next week in a full-width, lower-half layout.

Installation
1. Copy the `weeklycalendar` folder into your `modules/` directory.
2. Add the module to your `config/config.js`:

```js
{
  module: 'weeklycalendar',
  position: 'bottom_center',
  config: {
    calendars: [
      {
        url: 'https://calendar.google.com/calendar/ical/your_calendar/basic.ics',
      }
    ],
    showWeekends: true
  }
}
```

Notes
- This module reuses the CalendarFetcher logic from the default `calendar` module to fetch and parse .ics feeds.
- It currently implements a simple rendering skeleton and should be extended to support better layout, overlapping events, colors per calendar, and timezone/recurring rules.
