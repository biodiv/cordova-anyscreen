# cordova-screengod
Fixes your cordova screen resolution and media query problems.

The problem
-----------
Mobile Browsers, especially across Android 2.3-4.4, handle ```mediaQueries``` differently. Some ignore ```-webkit-device-pixel-ratio```, some use it as a multiplier of a given ```-device-height```, some not. Sometimes you get a low resolution by default although you have a highres device. Furthermore, the amount of screens out there is enormous with new screen definitions emerging all the time. IE again differs. While one should program responsive css, you sometimes might want to use ```pixels``` for ```padding``` or ```margin``` or for the root elements ```font-size```, which other ```rem``` or ```em``` values depend on. We cannot use ```vh``` etc. yet as it is not supported by older devices.

The solution
------------
Write as much responsive css as possible, avoid pixel values whenever possible.

Set ```html``` and ```body``` in you css file to ```100%```:

    html, body {
        width: 100%;
        height: 100%;
    }

Put ```screengod.js``` into your ```index.html```

    <script type="text/javascript" src="path/to/screengod.js"></script>

Move all pixel definitions into a second css file, e.g.

    html {
      font-size:16px;
    }

into e.g.

    screengod.css
    
Instead of linking your css file in the ```<head>``` tag, load it after your device is ready with

    screengod(['path/to/screengod.css'],function(){
        /* do your stuff */
    });
    
and you're done. You can pass as many css filepaths as you want. screengod also maps physical pixels to software pixels, giving you the full resolution of your device and the following readable values:

    app.deviceHeight  // the true height of your DEVICEs screen in pixels
    app.deviceWidth  // the true width of your DEVICEs screen in pixels 
    app.containerWidth  // the true width of your app container, without system bars
    app.containerHeight // the true height of your app container, without system bars

What you get
------------
All your elements will look exactly the same across all platforms, all screens. All your apps will have the full resolution of the device.

Platform support
----------------
- iOS 6,7,8
- Android 2.3, 4.x, 5.x
- Windows Phone 8.x (windows 10 coming soon)

How to set pixel sizes
----------------------
```1px``` is one pixel on a device with ```1080px``` width and ```>=1920px``` height, so this is your starting point.

How it works
------------
First, it attempts to map your software resolution to the devices native resolution.
Second, it measures if the attempt was successful and gets the available dimensions in pixels.
Finally, it scales your css values to the actual solution.

Why media queries are the wrong approach anyway
-----------------------------------------------
Media queries are intended to deliver different layouts, not for delivering the same layout. One would definitely use them for targeting portrait/landscape adaptations. In most cases it makes sense that your app looks the same across all resolutions, like done in native programming. And you should not have to bother about this. You should just program one design/layout and the software should adapt it automatically to look the same.
