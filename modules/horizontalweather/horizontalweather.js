/* global WeatherProvider */

/* MagicMirror²
 * Module: horizontalweather
 * Displays today's weather + next 5 days in a horizontal strip.
 */
Module.register("horizontalweather", {
  defaults: {
    weatherProvider: "weathergov",
    type: "current",
    units: config.units,
    tempUnits: config.units,
    windUnits: config.units,
    useKmh: false,
    lang: config.language,
    updateInterval: 10 * 60 * 1000,
    animationSpeed: 500,
    initialLoadDelay: 0,
    maxDays: 5,
    roundTemp: true,
    // Provider-specific options
    apiBase: "https://api.weather.gov/points/",
    weatherEndpoint: "forecast",
    lat: "42.26989",
    lon: "-71.6132"
  },

  getStyles: function () {
    return ["font-awesome.css", "weather-icons.css", "horizontalweather.css"];
  },

  getScripts: function () {
    return [
      "moment.js",
      this.file("../default/weather/weatherprovider.js"),
      this.file("../default/weather/weatherobject.js"),
      this.file("../default/weather/suncalc.js"),
      this.file("../default/weather/providers/" + this.config.weatherProvider.toLowerCase() + ".js")
    ];
  },

  start: function () {
    moment.locale(this.config.lang);
    if (typeof WeatherProvider === "undefined") {
      Log.error("horizontalweather: WeatherProvider failed to load. Check script paths.");
      this.loaded = true;
      return;
    }
    this.weatherProvider = WeatherProvider.initialize(this.config.weatherProvider, this);
    this.weatherProvider.start();

    this.loaded = false;
    this.initialForecastRequested = false;
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  scheduleUpdate: function (delay) {
    const next = (typeof delay === "number" && delay >= 0) ? delay : this.config.updateInterval;
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      this.fetchWeather();
      this.scheduleUpdate(this.config.updateInterval);
    }, next);
  },

  fetchWeather: function () {
    if (!this.weatherProvider) {
      return;
    }
    this.weatherProvider.fetchCurrentWeather();
    this.weatherProvider.fetchWeatherForecast();
  },

  updateAvailable: function () {
    const current = this.weatherProvider ? this.weatherProvider.currentWeather() : null;
    const forecast = this.weatherProvider ? (this.weatherProvider.weatherForecast() || []) : [];

    // Weather.gov may deliver current first during URL bootstrap; fetch forecast immediately
    // so the next 5 days render without waiting for the full update interval.
    if (current && forecast.length === 0 && !this.initialForecastRequested) {
      this.initialForecastRequested = true;
      this.weatherProvider.fetchWeatherForecast();
    }

    if (forecast.length > 0) {
      this.initialForecastRequested = false;
    }

    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
  },

  formatTemp: function (value) {
    if (value === null || typeof value === "undefined" || Number.isNaN(Number(value))) {
      return "--";
    }
    const decimals = this.config.roundTemp ? 0 : 1;
    return `${Number(value).toFixed(decimals)}°`;
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "horizontalweather";

    const current = this.weatherProvider ? this.weatherProvider.currentWeather() : null;
    const forecast = this.weatherProvider ? (this.weatherProvider.weatherForecast() || []) : [];

    if (!this.loaded || (!current && forecast.length === 0)) {
      wrapper.innerHTML = "<div class='dimmed small'>Loading weather...</div>";
      return wrapper;
    }

    const row = document.createElement("div");
    row.className = "weatherRow";

    // Today card first
    if (current) {
      row.appendChild(this.buildCard({
        label: "Today",
        weatherType: current.weatherType,
        primaryTemp: this.formatTemp(current.temperature),
        secondaryTemp: (current.minTemperature !== null && current.maxTemperature !== null)
          ? `${this.formatTemp(current.maxTemperature)} / ${this.formatTemp(current.minTemperature)}`
          : ""
      }, true));
    }

    // Next 5 days
    const today = moment().startOf("day");
    const nextDays = forecast
      .filter((d) => d && d.date && moment(d.date).isAfter(today, "day"))
      .slice(0, this.config.maxDays);

    nextDays.forEach((day) => {
      row.appendChild(this.buildCard({
        label: moment(day.date).format("ddd"),
        weatherType: day.weatherType,
        primaryTemp: this.formatTemp(day.maxTemperature),
        secondaryTemp: this.formatTemp(day.minTemperature)
      }, false));
    });

    wrapper.appendChild(row);
    return wrapper;
  },

  buildCard: function (item, isToday) {
    const card = document.createElement("div");
    card.className = "weatherCard" + (isToday ? " todayCard" : "");

    const label = document.createElement("div");
    label.className = "weatherLabel";
    label.innerText = item.label;

    const icon = document.createElement("span");
    icon.className = "wi weatherIcon " + (item.weatherType ? ("wi-" + item.weatherType) : "wi-na");

    const temp = document.createElement("div");
    temp.className = "weatherTemp";
    temp.innerText = item.primaryTemp;

    const detail = document.createElement("div");
    detail.className = "weatherDetail";
    detail.innerText = item.secondaryTemp || "";

    card.appendChild(label);
    card.appendChild(icon);
    card.appendChild(temp);
    card.appendChild(detail);

    return card;
  }
});
