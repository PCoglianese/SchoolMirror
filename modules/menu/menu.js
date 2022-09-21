//const moment = require("moment");

/* MagicMirror²
 * Module: Menu
 *
 */
Module.register("menu", {
	// Default module config.
	defaults: {
		updateInterval: 2.88e+7,
		mockDate:true,
		mockDateValue: "2022/08/31"
	},

	currentMenu: null,

	getStyles: function() {
		return [
			'menu.css'
		]
	},
	getTemplate: function () {
		return "menu.njk";
	},
	start: function () {
		// Schedule the first update.
		this.fetchCurrentMenu();
	},	
	getTemplateData: function () {

		return {
			config: this.config,
			current: this.currentMenu 
		};		

	},

	fetchCurrentMenu: function(){

		const todaysDate = this.config.mockDate ? this.config.mockDateValue : moment().format("YYYY/MM/DD");
		const menuAPI = this.config.menuURL+todaysDate+"/?format=json";
		//const formt="2022/08/29/?format=json";
		this.fetchData(menuAPI)
		.then((data) => {
			if (!data) {
				// Did not receive usable new data.
				console.log ("no Menu data? ");
				return;

			}
			this.currentMenu = this.getTodayAndTomorrow(data);
			//console.log(this.currentMenu);
		})
		.catch(function (request) {
			Log.error("Could not load Menu data ... ", request);
		})
		.finally(() => this.menuUpdateAvailable());	
	},
	menuUpdateAvailable: function(){

		this.menuUpdate();
		this.updateDom(0);

		this.sendNotification("SPECIALS_UPDATE");
	},
	menuUpdate: function (delay = null) {
		let nextLoad = this.config.updateInterval;
		if (delay !== null && delay >= 0) {
			nextLoad = delay;
		}
		setTimeout(() => {
			this.fetchCurrentMenu();
			console.log("Would be getting new schedule data")
		}, nextLoad);
	},		
	getTodayAndTomorrowz: function(menuData){
		var menu = {
			today: null,
			tomorrow: null,
		}
		const todaysDate = this.config.mockDate ? moment(this.config.mockDateValue, ["YYYY-MM-DD"]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
		const tomorrowsDate = this.config.mockDate ? moment(this.config.mockDateValue, ["YYYY-MM-DD"]).add(1,'days').format("YYYY-MM-DD") : moment().add(1,'days').format("YYYY-MM-DD");
		for(day in menuData.days){
			if(menuData.days[day].date == todaysDate){
				menu.today = menuData.days[day].menu_items;
			}
			if(menuData.days[day].date  == tomorrowsDate){
				menu.tomorrow = menuData.days[day].menu_items;
				return menu;
			}
		}
		return menu;
	},
	getTodayAndTomorrow: function(menuData){
		var menu = {
			data: null,
			day: null,
		}
		var menudate;
		var today = new Date();
		var curHr = today.getHours();
		if (curHr < 12) {
			menudate = this.config.mockDate ? moment(this.config.mockDateValue, ["YYYY-MM-DD"]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
			menu.day = "Today";
		  } else {
			menudate = this.config.mockDate ? moment(this.config.mockDateValue, ["YYYY-MM-DD"]).add(1,'days').format("YYYY-MM-DD") : moment().add(1,'days').format("YYYY-MM-DD");
			menu.day="Tomorrow"
		}
		for(day in menuData.days){
			if(menuData.days[day].date == menudate){
				menu.data = menuData.days[day].menu_items;
				return menu;
			}
		}
		return menu;
	},	
	// A convenience function to make requests. It returns a promise.
	fetchData: function (url, method = "GET", type = "json") {
		url = this.getCorsUrl() + url;
		const getData = function (mockData) {
			return new Promise(function (resolve, reject) {
				if (mockData) {
					let data = mockData;
					data = data.substring(1, data.length - 1);
					resolve(JSON.parse(data));
				} else {
					const request = new XMLHttpRequest();
					request.open(method, url, true);
					request.onreadystatechange = function () {
						if (this.readyState === 4) {
							if (this.status === 200) {
								if (type === "xml") {
									resolve(this.responseXML);
								} else {
									resolve(JSON.parse(this.response));
								}
							} else {
								reject(request);
							}
						}
					};
					request.send();
				}
			});
		};

		return getData(this.config.mockData);
	},
	getCorsUrl: function () {
		if (this.config.mockData || typeof this.config.useCorsProxy === "undefined" || !this.config.useCorsProxy) {
			return "";
		} else {
			return location.protocol + "//" + location.host + "/cors?url=";
		}
	},
	convertMenu: function(data){
		this.config.todaysmenu.start_date = data.start_date;

		return this.config.todaysmenu;
	},
		
});
