# horizontalweather

Horizontal top-row weather module for MagicMirror.

It shows:
- **Today** first (icon + current temperature)
- **Next 5 days** after today (icon + high/low)

This module reuses MagicMirror's default weather provider stack (`WeatherProvider`, `WeatherObject`, and provider files like `weathergov.js`) so weather visuals and data behavior are consistent with the default weather module.

## Example configuration

```js
{
  module: "horizontalweather",
  position: "top_right",
  config: {
    weatherProvider: "weathergov",
    units: "imperial",
    tempUnits: "imperial",
    windUnits: "imperial",
    updateInterval: 10 * 60 * 1000,
    maxDays: 5,
    lat: "42.26989",
    lon: "-71.6132"
  }
}
```
