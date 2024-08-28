/* MagicMirror² Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 */
let config = {
	address: "localhost", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/", 	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
					// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], 	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 12,
	units: "imperial",
	// serverOnly:  true/false/"local" ,
	// local for armv6l processors, default
	//   starts serveronly and then starts chrome browser
	// false, default for all NON-armv6l devices
	// true, force serveronly mode, because you want to.. no UI on this device

	modules: [

		{
			module: "clock",
			position: "top_left",
			timeFormat: 12,
			//clockBold:true,
			displaySeconds:false,

		},
		{
			module: "calendar",
			header: "Calendar",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check",
						//url: "webcal://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics"
						url: "https://calendar.google.com/calendar/ical/nseehatm1aig4si6pva0j5rvc4%40group.calendar.google.com/private-4c423afe963ed75de682f555eb8c6bcb/basic.ics"
					}
				],
			showEnd: true,
			wrapEvents: true,
			tableClass: "medium",
			dateFormat: "MMM Do",
			dateEndFormat: "hh:mm a",
			customEvents:[
				{
					keyword: 'Bridget',
					//color: 'white',
					symbol: 'square'
				},
				{
					keyword: 'Calvin',
					//color: 'white',
					symbol: 'circle'
				},
				{
					keyword: 'Bridget and Calvin',
					//color: 'white',
					symbol: 'group'
				}
			]
			}
		},
		{
			module: "weather",
			position: "top_right",
			header: "Today's Weather",
			config: {
				units: "imperial",
				onlyTemp:true,
				weatherProvider: "weathergov",
				apiBase: "https://api.weather.gov/points/",
				weatherEndpoint: "forecast",
				type: "current",
				tableClass: "xlarge",
				lat: "42.26989",
				lon: "-71.6132"
			}
		},
		{
			module: "weather",
			position: "top_right",
			header: "This Week",
			config: {
				units: "imperial",
				weatherProvider: "weathergov",
				maxNumberOfDays: 7,
				apiBase: "https://api.weather.gov/points/",
				weatherEndpoint: "forecastHourly",
				type: "forecast",
				tableClass: "medium",
				lat: "42.26989",
				lon: "-71.6132"
			}
		},
		/*
		{
			module: "teamsnap",
			position: "top_center",
			config: {
				updateInterval: 1.44e+7,
				useCorsProxy:true,
				mockDate:false,
				mockDateValue: "2022/09/01",
				menuURL :"https://westboroughk12.api.nutrislice.com/menu/api/weeks/school/hastings/menu-type/k-3-full-in-house-lunch/"
			}			
		},		
		*/
		{
			module: "specials",
			position: "top_center",
			config: {
				updateInterval: 1.44e+7,
				mockDay: false,
				mockDateValue: "2022/09/04",				
				schedURL:"https://raw.githubusercontent.com/PCoglianese/MagicMirrorConfigs/main/specialsconfig.js"
				}		
		},
		{
			module: "menu",
			position: "top_center",
			config: {
				updateInterval: 1.44e+7,
				useCorsProxy:true,
				mockDate:false,
				mockDateValue: "2022/09/01",
				menuURL :"https://westboroughk12.api.nutrislice.com/menu/api/weeks/school/hastings/menu-type/lunch/"
			}			
		},
		/*
		{
			module: "summer",
			position: "top_center",
			config: {
				updateInterval: 1.44e+7,
				mock: false,			
				summerURL:"https://raw.githubusercontent.com/PCoglianese/MagicMirrorConfigs/main/summer24.js"
			}		
		},
		*/
		{
			module: "screenshift",
			position: "bottom_center"		
		},		
		/*
		{
			module: "seedlings",
			position: "right_bottom",
			header: "Seedlings",
			config: {

			}
		},
		*/
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
