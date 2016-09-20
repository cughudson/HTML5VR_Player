/**
 *
 * 该模块应用到了hudson.js函数库以及swfObject函数库
 * 
 */
/*
global
	 _H, console, window, document, VRPlayer, swfobject, webGL, alert
*/

"use strict";
var base = "http://statics.bananavr.com/statics/upload/videos/";

var runPlayer_webgl = function(url){

	url = base + url;
	VRPlayer.setUpUI();
	VRPlayer.setUpVideo(url);
	VRPlayer.initUIEvent();
	VRPlayer.initScene();
	VRPlayer.initControl();
	setTimeout(VRPlayer.hideToolbarAuto, 3000);

};
var runVideoPlayer = function(url){
	if(webGL.isAvaiable){
		runPlayer_webgl(url);
	}else{
			alert("WebGL is not supported!!!");
		}
	};
_H(window).bind('load', function(){runVideoPlayer("1461899866994.mp4");});
