/* MagicMirror²
 * Module: Specials
 *
 */
Module.register("summer", {
	// Default module config.
	defaults: {
		updateInterval: 1.728e+8,
	},

	currentSchedule: null,

	getTemplate: function () {
		return "summer.njk";
	},
	getStyles: function() {
		return [
			'summer.css'
		]
	},
	start: function () {
		// Schedule the first update.
		this.fetchSummer();
	},	
	getTemplateData: function () {

		return {
			config: this.config,
			current: this.currentSchedule 
		};		

	},
	fetchSummer: function(){
		this.fetchData(this.config.summerURL)
		.then((data) => {
			if (!data) {
				// Did not receive usable new data.
				console.log ("no summer data? ");
				return;

			}
			this.currentSchedule = this.updateSchedule(data);
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

		this.sendNotification("SUMMER_UPDATE");
	},
	scheduleUpdate: function (delay = null) {
		let nextLoad = this.config.updateInterval; //1.728e+8
		if (delay !== null && delay >= 0) {
			nextLoad = delay;
		}
		setTimeout(() => {
			this.fetchSummer();
			console.log("Would be getting new camps data")
		}, nextLoad);
	},	
	updateSchedule: function(summerData){
		var newSchedule = new Array();
		summerData.summer.forEach((element) =>{
			var theDay = new Date();
			var from = Date.parse(element.starts);
			var to = Date.parse(element.ends);
			var today = Date.parse(theDay);

			var thisWeek = element;


			if(today < from){
				thisWeek.active = "summer_future";
			}else{
				thisWeek.active = "summer_past";
			}
			if(today >= from && today <= to){
				thisWeek.active = "summer_active";
			}

			newSchedule.push(thisWeek);
			//console.log(element);
		});

		return newSchedule;
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
		const getData = function (mock) {
			return new Promise(function (resolve, reject) {
				if (mock) {
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
		if (this.config.mock || typeof this.config.useCorsProxy === "undefined" || !this.config.useCorsProxy) {
			return "";
		} else {
			return location.protocol + "//" + location.host + "/cors?url=";
		}
	}
});
