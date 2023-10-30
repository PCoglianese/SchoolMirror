/* MagicMirror²
 * Module: Specials
 *
 */
Module.register("specials", {
	// Default module config.
	defaults: {
		updateInterval: 1.728e+8,
	},

	currentSchedule: null,

	getTemplate: function () {
		return "specials.njk";
	},
	getStyles: function() {
		return [
			'specials.css'
		]
	},
	start: function () {
		// Schedule the first update.
		this.fetchCurrentSchedule();
	},	
	getTemplateData: function () {

		return {
			config: this.config,
			current: this.currentSchedule 
		};		

	},
	fetchCurrentSchedule: function(){
		this.fetchData(this.config.schedURL)
		.then((data) => {
			if (!data) {
				// Did not receive usable new data.
				console.log ("no schedule data? ");
				return;

			}
			this.currentSchedule = this.getToday(data);
			//console.log(this.currentSchedule);
		})
		.catch(function (request) {
			Log.error("Could not load schedule data ... ", request);
		})
		.finally(() => this.schedUpdateAvailable());			
	},
	schedUpdateAvailable: function(){

		this.scheduleUpdate();
		this.updateDom(0);

		this.sendNotification("SPECIALS_UPDATE");
	},
	scheduleUpdate: function (delay = null) {
		let nextLoad = this.config.updateInterval; //1.728e+8
		if (delay !== null && delay >= 0) {
			nextLoad = delay;
		}
		setTimeout(() => {
			this.fetchCurrentSchedule();
			console.log("Would be getting new schedule data")
		}, nextLoad);
	},	
	getToday: function(schedData){
		var todaysSchedule = new Object;
		var theDay = new Date();
		var curDay = theDay.getHours() > 12 ? 1 : 0;

		const today = this.config.mockDay ? moment(this.config.mockDateValue, ["YYYY-MM-DD"]).format("dddd") : moment().add(curDay,'days').format('dddd');

		switch(today){
			case "Monday":
				todaysSchedule = schedData.specials.Monday;
				break;
			case "Tuesday":
				todaysSchedule = schedData.specials.Tuesday;
				break;
			case "Wednesday":
				todaysSchedule = schedData.specials.Wednesday;
				break;
			case "Thursday":
				todaysSchedule = schedData.specials.Thursday;
				break;
			case "Friday":
				todaysSchedule = schedData.specials.Friday;
				break;
			default:
				todaysSchedule.specials = false
				break;
		}
		todaysSchedule.dayFrame = curDay ? "Tomorrow" : "Today";
		console.log(todaysSchedule);
		return todaysSchedule
	},
	/*
	notificationReceived: function (notification, payload, sender) {
		if (notification === "SPECIALS_UPDATE") {
			this.updateDom(300);
		}
	},	
	*/
	// A convenience function to make requests. It returns a promise.
	fetchData: function (url, method = "GET", type = "json") {
		//url = this.getCorsUrl() + url;
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
	}
});
