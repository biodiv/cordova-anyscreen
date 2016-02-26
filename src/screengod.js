/*
 * 1px = 1px on a screen width width=1080px, while 1080px is the smaller side (e.g. 1080*1920)
*/
function anyscreen(css_urls, successCallback){
	
	if (typeof window["app"] == "undefined"){
		app = {};
	}
	
	/* the larger side ALWAYS is called 'height' */
	if (screen.width > screen.height) {
        app.deviceHeight = screen.width;
        app.deviceWidth = screen.height;
    }
    else {
        app.deviceHeight = screen.height;
        app.deviceWidth = screen.width;
    }
    
    /* try to fix screens */
    var dpr = window.devicePixelRatio;

	var viewport = document.createElement("meta");
	viewport.setAttribute("name","viewport");
    
    if (device.platform == "iOS" || device.platform == "Android"){
    	var version = parseFloat(device.version.slice(0,3));
    	
    	//var viewport = document.querySelector("meta[name=viewport]");

        var scaling = 1/dpr;

        if (device.platform == "Android"){
        	var initscale = 1.5; //setting a wrong value on Android fixes it
        }
        else {
        	var initscale = 1/dpr;
        }
        
        viewport.setAttribute('content', 'user-scalable=no, initial-scale=' + initscale + ', maximum-scale=' + scaling + ', minimum-scale=' + scaling + ', target-densitydpi=device-dpi');
    	
    }
    else if (device.platform == "windows") {

        if (dpr > 1) {
            
            /* this always works on IE11 */
            app.deviceHeight = Math.floor(app.deviceHeight * dpr);
            app.deviceWidth = Math.floor(app.deviceWidth * dpr);

            var msViewportStyle = document.createElement("style");

            var cssText = document.createTextNode(
                    "@-ms-viewport{width:" + app.deviceWidth + "px; height:" + app.deviceHeight + "px;}"
            );

            msViewportStyle.appendChild(cssText);

            document.head.appendChild(msViewportStyle);

			viewport.setAttribute("content","user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, target-densitydpi=device-dpi");
        }
    }

	if (device.platform == "Linux") {
		//var scaling = 1/dpr;
		//var viewport = document.querySelector("meta[name=viewport]");
		//viewport.setAttribute('content', 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height');
		app.deviceHeight = Math.max(document.body.clientWidth, document.body.clientHeight);
        app.deviceWidth = Math.min(document.body.clientWidth, document.body.clientHeight);
		viewport.setAttribute("content","user-scalable=no");
	}
	
	document.head.appendChild(viewport);

	// After adding viewport perform some checks

	/* measure available width & check if app.deviceWidth app.deviceHeight need adjustments */
    var measuredContainerWidth = Math.min(document.body.clientWidth,document.body.clientHeight),
    	calculatedContainerWidth = app.deviceWidth * dpr;
    
    /* measuredwidth/calculatedWidth = congruence in % as decimal number */
    var congruence = Math.min(measuredContainerWidth,calculatedContainerWidth) / Math.max(measuredContainerWidth,calculatedContainerWidth);

	/* adjust app.deviceHeight app.deviceWidth if necessary */
    if (calculatedContainerWidth == measuredContainerWidth || congruence > 0.9){
        app.deviceHeight = app.deviceHeight * dpr;
        app.deviceWidth = app.deviceWidth * dpr;
    }
    else{
        console.log("error rescaling screen");
    }    	
	
    /* measure truly available sizes */
    app.containerWidth = Math.min(document.body.clientWidth,document.body.clientHeight);
    app.containerHeight = Math.max(document.body.clientWidth,document.body.clientHeight);

	/* create handlebars helper if handlebars is present */
	if (typeof window.Handlebars != "undefined" && window.Handlebars != null){

		var imgFolder = "img/640up";

		if (app.deviceWidth >= 1440){
			imgFolder = "img/1440up/";
		}
		else if (app.deviceWidth >= 1080){
			imgFolder = "img/1080up/";
		}
		else if (app.deviceWidth >= 720){
			imgFolder = "img/720up/";
		}
		else if (app.deviceWidth >= 640) {
			imgFolder = "img/640up/";
		}
		else if (app.deviceWidth >= 400) {
			imgFolder = "img/400up/";
		}
		else {
			imgFolder = "img/low/";
		}

		 Handlebars.registerHelper("imgFolder", function () {
		    return imgFolder;
		});
	}
    
    /*
     * now app.deviceHeight, app.deviceWidth, app.containerWidth, app.containerHeight are set
    */
	
	quickWorkingLoop(css_urls, function(url, iterate){
		
		xhr = new XMLHttpRequest;
		xhr.onreadystatechange = function () {
	    	
	        if (xhr.readyState == 4) {
	        	
		        if (xhr.status == 200 || xhr.status == 0 ) {
		        	
		   			adapted_css_str = adaptCSS(xhr.responseText);
					
					var styleNode = document.createElement("style");

					if (device.platform == "windows") {
						MSApp.execUnsafeLocalFunction(function () {
							styleNode.innerHTML = adapted_css_str;
						});
					}
					else {
						styleNode.innerHTML = adapted_css_str;
					}

					document.body.appendChild(styleNode);
    					
		            iterate();
	        	}
	        	else {
	        		alert("[screengod] css file not found : " + url);
	        	}

	        }
	    };
	
	    xhr.open("GET", url, true);
	    xhr.send();
		
	}, successCallback);
	
}


function quickWorkingLoop(data, onIter,finishedCB){
	var index = -1,
		dataCount = data.length;
	
	function workLoop(){
		
		index++;
		
		if (index < dataCount){
			
			var obj = data[index];
			
			onIter(obj, workLoop);
			
		}
		else{
			if (typeof finishedCB == 'function'){
				finishedCB();
			}
		}
		
	}
	
	workLoop();
}

/* thx @  pravdomil.cz */
function adaptCSS(str) {
	
	var new_css_str = "";
	
    var buff = "";

    var blockOpen = false;
    var selBuff = "";

    var keyBuff = "";

    var valOpen = false;


	var mqueryOpen = false;
	var mqueryTagOpen = false;
	var mqueryBuff = "";

    for(var i in str) {
        var pol = str[i];

        if(pol=="\t") continue;

		if (pol == "@"){
			mqueryOpen = true;
			mqueryTagOpen = true;
			buff += pol;
			continue;
		}

		if (mqueryOpen){
			if(mqueryTagOpen){
				if(pol == "{"){
					mqueryBuff = buff;
					buff = "";
					mqueryTagOpen = false;

					new_css_str += mqueryBuff + "{";

					continue;
				}
			}
			if (!blockOpen) {
				if(pol == "}" ){
				
					mqueryOpen = false;
					mqueryBuff = "";

					new_css_str += "}";

					continue;
				
				}
			}
		}

        if(pol == "{")
        {        	
            blockOpen = true;
            selBuff = buff;
            buff = "";
            
            new_css_str += " " + selBuff + " {"; 
            
            continue;
        }

        if(blockOpen)
        {
            if(pol == "}")
            {
                blockOpen = valOpen = false;
                selBuff = keyBuff = buff = "";
                new_css_str += "}";
                continue;
            }

            if(!valOpen)
            {
                if(pol == ":") {
                    valOpen = true;
                    keyBuff = buff;
                    buff = "";
                    new_css_str += keyBuff + pol;
                    continue;
                }
            }
            else
            {
                if(pol == "\n" || pol==";" || str[i] == "}"){

                    var obj = {key:keyBuff, value:buff, selector:selBuff};
                    
                    var new_val = "";
	   				var val_parts = buff.split(" ");
	   				
	   				for (var v=0; v<val_parts.length; v++){
	   					var val_part = val_parts[v];
	   					
	   					if (val_part.indexOf("px") > 0){
	   						var number_value = parseInt(val_part.substr(0, val_part.length - 2));

							if (number_value != 0){

								if (keyBuff == "height"){
									var new_pixel_value_floored = Math.floor((number_value/1920)*app.containerHeight);
								}
								else {
		   							var new_pixel_value_floored = Math.floor((number_value/1080)*app.containerWidth);
								}
								var new_pixel_value = new_pixel_value_floored == 0 ? "1px" : new_pixel_value_floored + "px";
		   						
		   						new_val += new_pixel_value + " ";
							}
							else {
								new_val += "0px ";
							}
	   					}
	   					else {
	   						new_val += val_part + " ";
	   					}
	   				}
	   				
	   				new_css_str += new_val + ";";

                    valOpen = false;
                    keyBuff = buff = "";
                }
            }
        }

        pol == "\n" ? buff = "" : buff += pol;
    }
    
    return new_css_str;
	
}
