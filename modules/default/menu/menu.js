
/* MagicMirror²
 * Module: Menu
 *
 */
Module.register("menu", {
	// Default module config.
	defaults: {
		todaysmenu: {
			active:false
		},
		tomorrowsmenu:{
			active:false
		}
	},

	getTemplate: function () {
		return "menu.njk";
	},

	getTemplateData: function () {
		const menuData = this.getMenuData();
		return menuData;

	},
	getStyles: function() {
		return [
			'menu.css'
		]
	},
	getMenuData: function(){
		const todaysDate = "2022/08/31"; //moment().format("YYYY/MM/DD");

		//const formt="2022/08/29/?format=json";
		const menuData = this.fetchData(this.config.menuURL+todaysDate+"/?format=json");
		return this.convertMenu(menuData);

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
