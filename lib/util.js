/* global canvas, vrHMD, webGL */
// The file is using the library of lib.js and swfobject.js
(function(global) {
  'use strict';

  var util = {
       getScreenOrientation: function() {
          switch (window.screen.orientation || window.screen.mozOrientation) {
            case 'landscape-primary':
              return 90;
            case 'landscape-secondary':
              return -90;
            case 'portrait-secondary':
              return 180;
            case 'portrait-primary':
              return 0;
          }
          if (window.orientation !== undefined)
            return window.orientation;
    },

    mat4PerspectiveFromVRFieldOfView: function(fov, zNear, zFar) {
      
      var upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
      var downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
      var leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
      var rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);
      debugger;
      var xScale = 2.0 / (leftTan + rightTan);
      var yScale = 2.0 / (upTan + downTan);

      var out = new Float32Array(16); // Appropriate format to pass to WebGL
      out[0] = xScale;
      out[4] = 0.0;
      out[8] = -((leftTan - rightTan) * xScale * 0.5);
      out[12] = 0.0;

      out[1] = 0.0;
      out[5] = yScale;
      out[9] = ((upTan - downTan) * yScale * 0.5);
      out[13] = 0.0;

      out[2] = 0.0;
      out[6] = 0.0;
      out[10] = zFar / (zNear - zFar);
      out[14] = (zFar * zNear) / (zNear - zFar);

      out[3] = 0.0;
      out[7] = 0.0;
      out[11] = -1.0;
      out[15] = 0.0;

      return out;
    },

    isFullscreen: function() {
     return document.fullscreenElement ||
            document.webkitFullscreenElement||
            document.mozFullScreenElement ||
            document.webkitCurrentFullScreenElement;
    },

    setCanvasSize: function() {
      var screenWidth, screenHeight;
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = webGL.gl.webkitBackingStorePixelRatio ||
                                webGL.gl.mozBackingStorePixelRatio ||
                                webGL.gl.msBackingStorePixelRatio ||
                                webGL.gl.oBackingStorePixelRatio ||
                                webGL.gl.backingStorePixelRatio || 1;          
      var ratio = devicePixelRatio / backingStoreRatio;
        if (canvas.width != screenWidth * ratio || canvas.height != screenHeight * ratio) {
            canvas.width = screenWidth * ratio;
            canvas.height = screenHeight * ratio;
            canvas.style.width = screenWidth + 'px';
            canvas.style.height = screenHeight + 'px';
            canvas.style.left = 0+'px';
            window.ratio = (canvas.width/2)/canvas.height;
        }
    },
    timeFormat : function(time){

        var arrStr = [];
        var hour = Number(String(time / 3600).split(".")[0]);
        var minutes = Number(String(time / 60).split(".")[0]-hour * 60);
        var second =  Number(String(time).split(".")[0] - hour * 3600 - minutes * 60);
            arrStr.push(hour === 0 ? "00" : hour < 10 ? ("0" + hour) : hour);
            arrStr.push(minutes === 0 ? "00" : minutes < 10 ? ("0" + minutes) : minutes);
            arrStr.push(second === 0 ? "00" : second < 10 ? ("0" + second) : second);
            return arrStr.join(":");
    },
    degToRad : Math.PI / 180,
    radToDeg : 180 / Math.PI,
    embedSWF : function(id){
      include("js/lib.js");
      var videoContainer = _H(id);
      //remove the video container children
      var videoContainerChild =videoContainer.children();
          videoContainerChild.remove();
          swfobject.embedSWF("swf/VRPlayer.swf", id, 900, 600, 18);

    },
    requestAnimationFrame : function(callback){

      return window.requestAnimationFrame(callback) ||
             window.mozRequestAnimationFrame(callback)||
             window.msRequestAnimationFrame(callback) ||
             window.oRequestAnimationFrame(callback) ||
             setInterval(callback, 1000/60);
    }
};

  global.util = util;

})(window);
