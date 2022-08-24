/* MagicMirror²
 * Module: Specials
 *
 */
Module.register("specials", {
	// Default module config.
	defaults: {
		text: "BOOBAM"
	},

	getTemplate: function () {
		return "specials.njk";
	},

	getTemplateData: function () {
		const schedData = this.fetchData(this.config.schedURL);
		console.log(schedData);
		return schedData;

	},
	getStyles: function() {
		return [
			'specials.css'
		]
	},
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
