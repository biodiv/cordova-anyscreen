/* polyfill for integer check */
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};

var imgFolder = 'img/WVGA/';
	
function imageManager() {
	
    /* select image folder AFTER scaling and checking with screengod */
    if (app.deviceWidth >= 2048){
    	imgFolder = 'img/FULLHD/';
    }
    else if (app.deviceWidth >= 1200){
    	imgFolder = 'img/FULLHD/';
    }
    else if (app.deviceWidth >= 1080){
    	imgFolder = 'img/FULLHD/';
    }
    else if (app.deviceWidth >= 768){
    	imgFolder = 'img/WXGA/';
    }
    else if (app.deviceWidth >= 720){
    	imgFolder = 'img/WXGA/';
    }
    else if (app.deviceWidth >= 640) {/* true iPhone4 */
    	imgFolder = 'img/iPhone4/';
    }
    else if (app.deviceWidth >= 540){
    	imgFolder = 'img/WVGA/';
    }
    else if (app.deviceWidth >= 400) {
    	imgFolder = 'img/WVGA/';
    }
    else {
    	imgFolder = 'img/low/';
    }
    
    Handlebars.registerHelper('imgFolder', function () {
        return imgFolder;
    });
    
}