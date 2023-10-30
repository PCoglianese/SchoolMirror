/* MagicMirror²
 * Module: Seedlings
 *
 */
Module.register("seedlings", {
	getStyles: function() {
		return [
			'seedlings.css'
		]
	},
	getTemplate: function () {
		return "seedlings.njk";
	},	
	// Define start sequence.
	start: function () {
		//this.newCapture();
        this.startCycle();
	},
    startCycle:function(){
        setTimeout(() => {
            this.newCapture();
		}, 1.8e+6); 
    },
    newCapture:function(){
        const seedling_capture = document.getElementById("seedling_capture");
		seedling_capture.src = "http://10.0.0.17/capture";
        this.startCycle();
    }
});
