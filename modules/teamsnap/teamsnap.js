//const moment = require("moment");

/* MagicMirror²
 * Module: Menu
 *
 */
Module.register("teamsnap", {
	// Default module config.
	defaults: {
		updateInterval: 2.88e+7,
		mockDate:true,
		mockDateValue: "2022/08/31",
		clientID:"74xHfFVWzH3l1NP6R4nEpHVZvmimXwY5rM9yaVgDq-s",
		clientSecret:"VlDl55-t9ih8acsJoiA-qHBjtAEr21uEkxiqVzEpmaE",
		callbackURL:"https://localhost:8080/"
	},

	currentMenu: null,

	getStyles: function() {
		return [
			'teamsnap.css'
		]
	},
	// Define required scripts.
	getScripts: function () {
		return ["teamsnap.min.js"];
	},	
	getTemplate: function () {
		return "teamsnap.njk";
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


		const clientID = this.config.clientID;

		teamsnap.init(clientID);

		if (teamsnap.hasSession()) {
			teamsnap.auth();
			teamsnap.loadCollections(function(err) {
			  if (err) {
				alert("Error loading TeamSnap SDK");
				return;
			  }
			  teamsnap.loadTeams(onTeamsLoad);
			});
		  }else{
			var redirect = this.config.callbackURL; // One of the redirect URLs entered when creating your application, must be same-domain
			var scopes = ["read", "write"];
			teamsnap.startBrowserAuth(redirect, scopes, function(err) {
			  if (err) {
				alert("Error loading TeamSnap SDK");
				return;
			  }
			  teamsnap.loadCollections(function(err) {
				teamsnap.loadTeams(onTeamsLoad);
			  });
			});

		  }

		  /*
		  teamsnap.enablePersistence();
			teamsnap.bulkLoad(teamId, function(err, items) {
			var team = items.filter(function(item) { return item.type == 'team' }).pop();
			console.log(team);
			console.log(team.members);
			console.log(team.events);
			console.log(team.trackedItems);
			});
		*/
/*
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
*/
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
