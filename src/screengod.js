/*
 * VERSION: beta 0.1
 * 1px = 1px on a screen width width=1080px, while 1080px is the smaller side (e.g. 1080*1920)
*/
function screengod(css_urls, successCallback){
	
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
    
    if (device.platform == "iOS" || device.platform == "Android"){
    	var version = parseFloat(device.version.slice(0,3));
    	
    	var viewport = document.querySelector("meta[name=viewport]");

        var scaling = 1/dpr;

        if (device.platform == "Android"){
        	var initscale = 1.5; //setting a wrong value on Android fixes it
        }
        else {
        	var initscale = 1/dpr;
        }
        
        viewport.setAttribute('content', 'user-scalable=no, initial-scale=' + initscale + ', maximum-scale=' + scaling + ', minimum-scale=' + scaling + ', target-densitydpi=device-dpi');
        
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
            //alert("error rescaling screen");
        }    	
    	
    }
    else if (device.platform == "windows") {

        if (dpr > 1) {
            
            /* this always works on IE11 */
            app.deviceHeight = Math.floor(init_deviceHeight * dpr);
            app.deviceWidth = Math.floor(init_deviceWidth * dpr);

            var msViewportStyle = document.createElement("style");

            var cssText = document.createTextNode(
                    "@-ms-viewport{width:" + app.deviceWidth + "px; height:" + app.deviceHeight + "px;}"
            );

            msViewportStyle.appendChild(cssText);

            document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
        }
    }
    
    /* measure truly available sizes */
    app.containerWidth = Math.min(document.body.clientWidth,document.body.clientHeight);
    app.containerHeight = Math.max(document.body.clientWidth,document.body.clientHeight);
    
    /*
     * now app.deviceHeight, app.deviceWidth, app.containerWidth, app.containerHeight are set
    */
	
	quickWorkingLoop(css_urls, function(url, iterate){
		
		xhr = new XMLHttpRequest;
		xhr.onreadystatechange = function () {
	    	
	    	console.log('xhr state: ' + xhr.readyState);
	    	
	        if (xhr.readyState == 4) {
	        	
		        if (xhr.status == 200 || xhr.status == 0 ) {
		        	
		   			adapted_css_str = adaptCSS(xhr.responseText);
					
					var styleNode = document.createElement("style");
					setInnerHTML(styleNode, adapted_css_str);
					document.body.appendChild(styleNode);
    					
		            iterate();
	        	}
	        	else {
	        		alert("[screengod] css file not found!");
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

    for(var i in str) {
        var pol = str[i];

        if(pol=="\t") continue;

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
	   						var new_pixel_value = Math.floor((number_value/1080)*app.deviceWidth) + "px";
	   						
	   						new_val += new_pixel_value + " ";
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

/* winjs compatibility */
function setInnerHTML(container, html) {

    if (device.platform == "windows") {
        MSApp.execUnsafeLocalFunction(function () {
            container.innerHTML = html;

        });
    }
    else {
        container.innerHTML = html;
    }
}

function insertAdjacentHTML(location, html, container) {

    if (device.platform == "windows") {
        MSApp.execUnsafeLocalFunction(function () {
            container.insertAdjacentHTML(location, html);

        });
    }
    else {
        container.insertAdjacentHTML(location, html);
    }

}
