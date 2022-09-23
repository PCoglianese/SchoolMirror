/* MagicMirror²
 * Module: Compliments
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("screenshift", {
	getStyles: function() {
		return [
			'screenshift.css'
		]
	},
	// Define start sequence.
	start: function () {
        this.startCycle();
	},
    startCycle:function(){
        setTimeout(() => {
            this.shiftScreen();
		}, 1.8e+6); 
    },
    shiftScreen:function(){
        const bodyDOM = document.querySelector("body");
        const isShiftOn = bodyDOM.classList.contains("shift_on");
        if(!isShiftOn){
            bodyDOM.classList.add("shift_on");
        }else{
            bodyDOM.classList.remove("shift_on");
        }
        this.startCycle();
    }
});