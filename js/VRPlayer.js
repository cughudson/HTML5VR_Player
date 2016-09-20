//
// The module is contain the function to control the video player and configure the vrplayer's UI 
// 



//jslint specify
/*global
	platformConfigs, webGL, _, console, window, _c, mat4, _H, util
*/

 "use strict";
 
 /**
  * configure the UI and the player
  * @type {Object}
  */
var playerConfigs = {
		'isfullscreen' : false, 
		'isdbscreen': false, 
		'toolbarVisible' : true, 
		'enableorientation' : false, 
		'ratio' : 1, 
		'signal' : 0,
		'reqAnimFrameID' : null,
		'defaultVolume' : 0.4, //range from 0 to 1;
		'videoWidth' : platformConfigs.platform.desktop ? 900 : window.screen.width, 
		'videoHeight' : platformConfigs.platform.desktop ? 600 : window.screen.height,
		'isMute' : false 
};

//tempCollect 用于维护在程序运行或者是交互过程当中的一些数据信息，如视频的播放状态，按钮的状态，以及视频声音的大小等；
var tempCollect = {

		'mousedown' : false,
		'target' : null,
		'left' : null,
		'bottom' : null,
		'mouseX' : null,
		'mouseY' : null,
		'currentVolume' : null,
		'currentLeft':null,
		'progressBarWidth': null,
		'soundSliderBarHeight': null,
		'videoState' : null,
		'timeoutId': null

};
//该对象当前还未用到，用来对视频的声音大小进行控制
var soundPlayControls_mobile = {

	'startX':null,
	'startY':null,
	'currentTime' : null,
	'currentVolume' : null

};
var VRPlayer  = {
	initScene : function(){
		var gl;
		webGL.initWebGL(_.videoContainer);	
		gl = webGL.gl;
		console.log(gl);		
		if(gl){
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(webGL.gl.DEPTH_TEST);
			webGL.initShader({
				fragmentShaderName: 'shader-fs',
				vertexShaderName: 'shader-vs',
				attributes: ['aTextureCoord','aVertexPosition'],
				uniforms: ['uSampler', 'projectMatrix','modelViewMatrix']
			});
			webGL.initBuffers();
			webGL.initTextures();
		}
	},
	//根据视频的运行平台为视频添加不同的控制方式，如PC端就是鼠标控制，移动端为触摸控制
	initControl : function(){

		if(platformConfigs.platform.desktop){
			_c.mouseControls.addMouseControls(_.videoContainer);
		}else{
			_c.touchControls.addTouchControls(_.doc);
			_c.deviceControls.addDeviceControls();
		}
	},
	//渲染三维场景，并进行单双屏切换控制
	render : function(){

			var canvas = webGL.canvas;
			webGL.setCanvasSize(_.videoContainer);
			webGL.updateTexture(_.video.ele[0]);
			if(playerConfigs.isdbscreen){
				mat4.perspective(webGL.projectionMatrix, Math.PI/4, ( canvas.width* 0.5) / canvas.height, 0.01, 10);
				webGL.drawEye(0, 0, canvas.width / 2, canvas.height, 0);
				webGL.drawEye(canvas.width / 2, 0,  canvas.width / 2, canvas.height,1);
			}else{
				mat4.perspective(webGL.projectionMatrix, Math.PI/4, canvas.width / canvas.height, 0.01, 10);
				webGL.drawEye(0, 0, canvas.width, canvas.height, 2);
			}
			webGL.updateMatrix();	
			playerConfigs.reqAnimFrameID = window.requestAnimationFrame(VRPlayer.render);
	},
	/**
	 * 设置并加载需要播放的视频
	 * 
	 */
	setUpVideo : function(url){
		var promise;
		_.video.children().setAttr({"src":url});
		_.video.setAttr({"src":url});
		_.video.ele[0].load();
		promise = _.video.ele[0].play();
		if(promise){
			_.video.ele[0].pause();
		}
	},
	/*
	* 1. 获取与视频相关的各个DOM对象，并将其存储在UIEle这个全局对象当中
	* 2. 根据视频播放器所处的平台来显示视屏的UI
	* 3. 初始化视屏的尺寸
	* 4. 获取视频快进进度条以及声音slider的尺寸
	* 
	*/	
	setUpUI : function(){

		var UIEle = {};
		window._ = UIEle;
		UIEle.videoToolbar = _H('#toolbar');
		UIEle.videoContainer = _H("#video-container");
		UIEle.video = _H('video');
		UIEle.videoTime = _H(".video-time");
		UIEle.poster = _H(".poster");
		//视频控制
		UIEle.playBtn = _H('.play-btn');
		UIEle.dbScreenBtn = _H('.dbscreen-btn');
		UIEle.orientationBtn = _H('.orientation-btn');
		UIEle.fullScreenBtn = _H('.fullscreen-btn');
		UIEle.soundBtn = _H(".sound-btn");
		//进度控制
		UIEle.playForward = _H('.play-forward');
		UIEle.buffer = _H(".buffer");
		UIEle.progress = _H(".progress");
		UIEle.progressBar = _H(".progressbar");
		//音量控制
		UIEle.soundBtnWrapper = _H('.sound-btn-wrapper');
		UIEle.soundSliderBtn = _H('.sound-slider-btn');
		UIEle.soundSliderBar = _H('.sound-slider-bar');
		UIEle.soundControlBar = _H('.sound-controls');
		UIEle.soundNum = _H(".sound-num");
		//其他
		UIEle.canvas = _H('.canvas');
		UIEle.doc = _H(document);
		UIEle.win = _H(window);
		UIEle.body = _H(document.body);

		//初始化进度条的长度和声音滑动条的高度其中progressBarWidth在进行全屏缩放时，其尺寸会发生变化，而
		//soundSliderBar的高度是不会发生变化的，因此只需要初始化一次即可
		//注意UI初始化的顺序，先初始化videocontainer的大小，然后计算progressBarwidth，因为progressBar的大小是根据来的videoContainer来计算的
		//否则会出现意想不到的错误
		
		if(platformConfigs.platform.desktop){
			UIEle.orientationBtn.addClass("hidden");
			UIEle.orientationBtn = null;
			//初始化video的大小；
			_.videoContainer.setStyleValue({"width" : playerConfigs.videoWidth + "px"});
			_.videoContainer.setStyleValue({"height" : playerConfigs.videoHeight + "px"});
		}else{
			_.videoContainer.setStyleValue({"width" : playerConfigs.videoWidth + "px"});
			_.videoContainer.setStyleValue({"height" : playerConfigs.videoHeight + "px"});
		}
		var progressBarWidth = parseInt(_.progressBar.getStyleValue("width"));
		var soundSliderBarHeight = parseInt(_.soundSliderBar.getStyleValue("height"));

			tempCollect.progressBarWidth = progressBarWidth;
			tempCollect.soundSliderBarHeight = soundSliderBarHeight;

			console.log("inital UI successfully");

	},
	//为移动端和PC端绑定事件
	initUIEvent : function(){
		//绑定移动端事件
		if(!platformConfigs.platform.desktop){
			_.orientationBtn.bind('click', VRPlayer.orientationControls);
			_.orientationBtn.bind('tap', VRPlayer.orientationControls);

			_.videoContainer.bind('tap', VRPlayer.handleToolbarOnMobile);		
			_.videoContainer.bind('click', VRPlayer.handleToolbarOnMobile);	

			_.dbScreenBtn.bind('click', VRPlayer.dbScreenControls);
			_.dbScreenBtn.bind('tap', VRPlayer.dbScreenControls);

			_.playBtn.bind('click', VRPlayer.togglePlay);
			_.playBtn.bind('tap', VRPlayer.togglePlay);
			_.fullScreenBtn.bind('click', VRPlayer.toggleFullScreen);
			_.fullScreenBtn.bind('tap', VRPlayer.toggleFullScreen);

			_.progressBar.bind('tap', VRPlayer.playForward_Mobile);
			_.progressBar.bind('click', VRPlayer.playForward_Mobile);

			_.doc.bind("touch",VRPlayer.togglePlay);
			_.doc.bind("tap",VRPlayer.togglePlay);
			_.video.bind('buffering', VRPlayer.handleBuffering);
			_.win.bind('resize', VRPlayer.handleResize_Mobile);
		}else{
		//绑定PC端事件
			_.playBtn.bind('click', VRPlayer.togglePlay);
			_.dbScreenBtn.bind('click', VRPlayer.dbScreenControls);
			_.soundBtn.bind('click', VRPlayer.soundControls);
			_.videoToolbar.bind('mousedown', VRPlayer.handleMouseDown);
			_.videoContainer.bind('mousemove', VRPlayer.handleMouseMove);
			_.doc.bind('mouseup', VRPlayer.handleMouseUp);

			_.videoContainer.bind('mousemove', VRPlayer.handleToolbarOnPC);
			_.dbScreenBtn.bind('click', VRPlayer.dbScreenControls);
			_.fullScreenBtn.bind('click', VRPlayer.toggleFullScreen);

			_.soundBtnWrapper.bind("mouseover", VRPlayer.soundUIControls);
			_.soundBtnWrapper.bind("mouseout", VRPlayer.soundUIControls);
			
		}
		//绑定PC端和移动端所共有的事件
		_.win.bind('webkitfullscreenchange', VRPlayer.handleFullScreenChange);
		_.win.bind('mozfullscreenchange', VRPlayer.handleFullScreenChange);
		_.win.bind('fullscreenchange', VRPlayer.handleFullScreenChange);
		_.win.bind('MSFullscreenChange', VRPlayer.handleFullScreenChange);

		_.video.bind('timeupdate', VRPlayer.videoTimeUpdate);
		_.video.bind('progress', VRPlayer.videoProgress);
		_.video.bind('ended', VRPlayer.handleVideoEnded);
		_.video.bind('loadedmetadata', VRPlayer.loadedMataData);
		_.videoContainer.bind('click', VRPlayer.toolbarControls);
		_.playBtn.bind('click', VRPlayer.togglePlay);
		_.videoTime.bind('click', VRPlayer.changeTimeFormat);

		console.log("inital UI Event Successfully");
	},
	//PC端的鼠标按下时的触发函数，仅用来控制视频的播放进度以及音量
	playForward_handleMouseDown:function(event){

		tempCollect.mousedown = true;
		tempCollect.target = _H(event.target);
		tempCollect.left = parseInt(tempCollect.target.getStyleValue("left"));
		tempCollect.mouseX = parseInt(event.clientX);
	},
	//PC端的快进控制：鼠标移动
	playForward_handleMouseMove:function(){

		var leftPos = null,
			currentTime = null;
		var video = _.video.ele[0];
		var leftInPix;
		var leftInPercent;
		if(tempCollect.mousedown){

			_.body.addClass("w-resize-cursor");
			_.videoContainer.addClass("w-resize-cursor");

			leftPos = Math.max(0, Math.min(tempCollect.progressBarWidth, tempCollect.left  + event.clientX - tempCollect.mouseX));		
			currentTime = (leftPos / tempCollect.progressBarWidth) * video.duration;
			video.currentTime = currentTime;

			leftInPix = Math.max(0, Math.min(leftPos, tempCollect.progressBarWidth )) - 5;
			leftInPercent = 100 * leftInPix / tempCollect.progressBarWidth ;
			tempCollect.target.setStyleValue({"left": leftInPercent + "%"});

			VRPlayer.setShowTime(video.duration, currentTime);
		}
	},
	//PC端的快进控制：鼠标松开
	playForward_handleMouseUp:function(){
		if(tempCollect.mousedown){

			tempCollect.mousedown = false;
			_.body.removeClass("w-resize-cursor");
			_.body.addClass("default-cursor");
			_.videoContainer.removeClass("w-resize-cursor");
			_.videoContainer.addClass("default-cursor");
			tempCollect.target = null;
		}
	},
	//PC端的声音控制：鼠标按下
	soundControl_handleMouseDown : function(event){

 		tempCollect.mousedown = true;
 		tempCollect.target = _H(event.target);
 		tempCollect.bottom = parseInt(_.soundSliderBtn.getStyleValue("bottom"));
 		tempCollect.mouseY = parseInt(event.clientY);
	},
	//PC端的声音控制：鼠标移动
	soundControl_handleMouseMove : function(event){

		var bottom = null,
			volumeNum,
			video = _.video.ele[0];
		if(tempCollect.mousedown){
			if(playerConfigs.isMute){

				video.muted = false;
				_.soundBtn.removeClass("mute-active");
			}
			_.body.addClass("pointer-cursor");
			_.videoContainer.addClass("pointer-cursor");
			bottom = Math.max(-4, Math.min(tempCollect.soundSliderBarHeight - 4, tempCollect.bottom + tempCollect.mouseY - event.clientY));
			tempCollect.target.setStyleValue({"bottom":bottom + "px"});
			volumeNum = Math.floor((bottom + 4) * 10/7);
			_.soundNum.html(volumeNum);
			VRPlayer.setSoundVolume(volumeNum);
		}
	},
	//PC端的声音控制：鼠标松开
	soundControl_handleMousUp : function(){

		if(tempCollect.mousedown){
			tempCollect.mousedown = false;
			tempCollect.target = null;
			_.body.removeClass("pointer-cursor");
			_.body.addClass("default-cursor");
			_.videoContainer.removeClass("pointer-cursor");
			_.videoContainer.addClass("default-cursor");
		}
	},
	handleMouseDown : function(event){
		//移除鼠标对视屏三维场景的控制
		if(platformConfigs.platform.desktop){
			_c.mouseControls.removeMouseControls();
		}else{    
			_c.touchControls.removeTouchControls();
		}
		//检查鼠标按下去的时候，事件所对应的DOM对象
		//如果是快进按钮
		if(_H(event.target).hasClass("play-forward")){
			VRPlayer.playForward_handleMouseDown(event);
		//如果是声音控制进度条
		}else if(_H(event.target).hasClass("sound-slider-btn")){
			VRPlayer.soundControl_handleMouseDown(event);
		}
	},
	//PC端的鼠标移动时的触发函数
	handleMouseMove : function(event){
		if(tempCollect.target){
			if(tempCollect.target.hasClass("play-forward")){
				VRPlayer.playForward_handleMouseMove(event);
			}else if(tempCollect.target.hasClass("sound-slider-btn")){
				VRPlayer.soundControl_handleMouseMove(event);
			}
		}

	},
	//PC端的鼠标松开时的触发函数；
	handleMouseUp : function(event){
		if(platformConfigs.platform.desktop){
			_c.mouseControls.addMouseControls(_.videoContainer);
		}else{
			_c.touchControls.addTouchControls(_.doc);
		}
		if(tempCollect.target){
			if(tempCollect.target.hasClass("play-forward")){

				VRPlayer.playForward_handleMouseUp(event);
			}else if(tempCollect.target.hasClass("sound-slider-btn")){

				VRPlayer.soundControl_handleMousUp(event);
			}
		}
	},
	//移动端的触摸开始时的函数;
	handleTouchstart :function(event){

		if(platformConfigs.platform.desktop){
			_c.mouseControls.removeMouseControls();
		}else{    
			_c.touchControls.removeTouchControls();
		}
		if(_.poster.hasClass('loading')) return;

		tempCollect.poster = true;
		//设置初始时刻的坐标及视频当前时间和音量
		soundPlayControls_mobile.startX = event.touches[0].clientX;
		soundPlayControls_mobile.startY = event.touches[0].clientY;
		soundPlayControls_mobile.currentTime = _.video.ele[0].currentTime;
		soundPlayControls_mobile.currentVolume = _.video.ele[0].volume * 100;

	},
	//移动端的触摸移动时的函数;
	handleTouchmove : function(event){

		var lenY = null, 
			gapeTime = null,
			gapeSound = null,
			lenX = null;
		var video = _.video.ele[0];
		//判断是否是快进还是声音的增减
		if(event.type == "play:controls"){
			lenX = event.detail.clientX - soundPlayControls_mobile.startX;
			gapeTime = lenX * 0.1;
			video.currentTime = Math.max(0, Math.min(soundPlayControls_mobile.currentTime + gapeTime, video.duration));
			_.progress.setStyleValue({"width":100 * video.currentTime / video.duration + "%"});
			VRPlayer.setShowTime(video.duration, video.currentTime);

		}else if(event.type == "sound:controls"){
			lenY = - (event.detail.clientY - soundPlayControls_mobile.startY);
			gapeSound = lenY * 0.3;
			video.volume = Math.max(0, Math.min(soundPlayControls_mobile.currentVolume + gapeSound, 100) / 100);
			console.log(video.volume);
		}
	},
	//触摸结束时的控制函数;
	handleTouchend : function(){

		if(platformConfigs.platform.desktop){
			_c.mouseControls.addMouseControls(_.videoContainer);
		}else{    
			_c.touchControls.addTouchControls(_.doc);
			console.log("add touchControls success");
		}
		if(!tempCollect.poster) return;
		tempCollect.poster = false;
		_.poster.removeClass("show-poster");
		_.poster.addClass("hide-poster");
	},
	//PC端的快进控制：鼠标按下
	//移动端的快进控制
	playForward_Mobile : function(event){

		var video = _.video.ele[0];
		var duration = video.duration;
			video.currentTime =  duration * (event.clientX / tempCollect.progressBarWidth);
			_.progress.setStyleValue({"width" : event.clientX * 100/ tempCollect.progressBarWidth + "%"});
	},
	//视频缓存控制，目前未使用
	handleBuffering:function(){

		_.video.ele[0].pause();
		_.poster.removeClass("opacity0");
		_.poster.addClass("opacity5");
		_.poster.addClass("loading");

	},
	//设置声音的大小，number 是一个0到100的数字；
	setSoundVolume : function(number){

		number = Math.max(0, Math.min(number, 100));
		tempCollect.currentVolume = number;
		_.video.ele[0].volume = number * 0.01;
	},
	//陀螺仪控制;
	orientationControls : function(){
		if(playerConfigs.enableorientation){

			playerConfigs.enableorientation = false;
			_.orientationBtn.removeClass('orientation-active');
		}else{

			playerConfigs.enableorientation = true;
			_.orientationBtn.addClass('orientation-active');
		}
	},
	soundControls : function(){
		if(playerConfigs.isMute){

			_.soundBtn.removeClass('mute-active');
			_.video.ele[0].muted = false;
			_.video.ele[0].volume = tempCollect.currentVolume / 100;
			playerConfigs.isMute = false;
		}else{
			_.soundBtn.addClass('mute-active');
			playerConfigs.isMute = true;
			_.video.ele[0].muted = true;
		}
	},
	//鼠标悬停声音控制按钮时，声音控件的UI'
	soundUIControls : function(event){

		if(event.type == "mouseover"){

			_.soundControlBar.removeClass("hide-sound-controls");
			_.soundControlBar.addClass("show-sound-controls");

		}else if(event.type == "mouseout"){

			_.soundControlBar.removeClass("show-sound-controls");
			_.soundControlBar.addClass("hide-sound-controls");
		}
	},
	//单双屏切换控制
	dbScreenControls : function(){

		if(playerConfigs.isdbscreen){
			playerConfigs.isdbscreen = false;
			_.dbScreenBtn.removeClass('dbscreen-active');
			playerConfigs.ratio = _.videoContainer.width / _.videoContainer.height;
		}else{
			playerConfigs.isdbscreen = true;
			_.dbScreenBtn.addClass('dbscreen-active');
			playerConfigs.ratio = (_.videoContainer.width / 2) / _.videoContainer.height;
		}

	},
	//视频时间更新（播放）时
	videoTimeUpdate : function(){

		var currentTime = _.video.ele[0].currentTime,
			duration = _.video.ele[0].duration;
		var leftInPix = null, leftInPercent = null;
		var width = (currentTime /duration) *100;
			_.progress.setStyleValue({"width" : width + "%"});
			if(parseInt(_.progress.getStyleValue("width")) !== (parseInt(_.playForward.getStyleValue("left") || 0))){

				leftInPix = Math.max(0, Math.min((currentTime  / duration) * (tempCollect.progressBarWidth), tempCollect.progressBarWidth)) - 5;
				leftInPercent = 100 * leftInPix / tempCollect.progressBarWidth;
				_.playForward.setStyleValue({"left": leftInPercent + "%"});
			}
			VRPlayer.setShowTime(duration, currentTime);	
	},
	//设置视频时间控件的显示
	setShowTime : function(duration, currentTime){

		var showTime = null;
		var durationTime =  _.video.ele[0].duration;
		var durationFormat = util.timeFormat(durationTime);
		var currentTimeFormat = util.timeFormat(currentTime);
		var leftTime = util.timeFormat(durationTime - currentTime);

			switch(playerConfigs.signal %3) {
				case 0:
					showTime = currentTimeFormat + ' / ' + durationFormat;
					break;
				case 1:				
					showTime = leftTime;
					break;
				case 2:
					showTime = currentTimeFormat;
					break;
			}
			_.videoTime.html(showTime);
	},
	//控制视频时间控制的显示格式，显示格式与signal的数值直接相关
	changeTimeFormat : function(){
		playerConfigs.signal++;

	},
	//计算视频的播放进度
	videoProgress : function(){
		var width,
			video = _.video.ele[0];
		if(video.buffered.length !== 0){
		    var bufferTime = video.buffered.end(0) - video.buffered.start(0);
		    width =  Math.floor(bufferTime*10000)/Math.floor(video.duration*10000)*100+"%";
		    _.buffer.setStyleValue({"width": width});
		  }
	},
	//视频结束时触发的事件
	handleVideoEnded : function(){
		_.playBtn.removeClass('play');
	},
	//视频播放函数
	play : function (){

		var video = _.video.ele[0];
		var promise;
		if(_.poster.hasClass("hidden")){
			_.poster.addClass("hidden");
		}
		if(video.ended){
			_.playForward.setStyleValue({"left" : "0%"});
			if(playerConfigs.reqAnimFrameID){
				window.cancelAnimationFrame(playerConfigs.reqAnimFrameID);
			}
		}
		promise = video.play();
		if(playerConfigs.reqAnimFrameID){
			playerConfigs.reqAnimFrameID = window.requestAnimationFrame(VRPlayer.render);
		}else{
			VRPlayer.render();
		}		
		return promise;
	},
	//视频暂停函数
	pause : function(){

		_.video.ele[0].pause();

	},
	//视频播放切换函数
	togglePlay : function(){

		var video = _.video.ele[0];
		if(video.paused === true || video.ended === true){
			VRPlayer.play();
			_.playBtn.addClass('play');
		}else{
			VRPlayer.pause();
			_.playBtn.removeClass('play');
		}

	},
	//视频元数据加载完成时的函数
	loadedMataData : function(){

		/**
		 * 1. 此函数的功能是设置视频时间显示
		 * 2. 设置默认的声音大小
		 * 3. 初始化声音控件的一些设置如，滑块的位置等等
		 * 4. 渲染“一帧”图像. 这里设置为0.5S的视频播放时间，其实事件可以根据实际情况进行设置
		 * 
		 */
		console.log("loaded meta data");
		var bottom, promise;
		_.videoTime.html(util.timeFormat(0) + " / " + util.timeFormat(_.video.ele[0].duration));
		_.video.ele[0].volume = playerConfigs.defaultVolume;
		tempCollect.currentVolume =  playerConfigs.defaultVolume * 100;

		bottom = tempCollect.currentVolume * ( 70 / 100 ) - 4; 
		_.soundSliderBtn.setStyleValue({"bottom" : bottom + "px" });
		_.soundNum.html(tempCollect.currentVolume);
		_.video.currentTime = 0.5;
		promise = VRPlayer.play();
		if(promise !== undefined){
			promise.then(
				function(){
					VRPlayer.pause();
				});
		}else{
			VRPlayer.pause();
		}
	},
	//视频重播
	rePlay : function(){
		var video = _.video.ele[0];
		video.currentTime = 0;
		video.play();
	},
	//全屏与视频默认状态之间的切换
	toggleFullScreen : function(){

		var container = _.videoContainer.ele[0];
		if(!playerConfigs.isfullscreen){
		     if (container.mozRequestFullScreen) {
		         container.mozRequestFullScreen(); // Firefox
		    } else if (container.webkitRequestFullscreen) {
		        container.webkitRequestFullscreen(); // Chrome and Safari
		    } else if (container.msRequestFullscreen){
		        document.documentElement.msRequestFullscreen();
		    } else if (container.requestFullScreen){
		    	container.requestFullscreen();
		    }
		}else{
		    if(document.mozCancelFullScreen){
		        document.mozCancelFullScreen();
		    }else if(document.webkitExitFullscreen){
		        document.webkitExitFullscreen();
		    }else if(document.msExitFullscreen){
		        document.msExitFullscreen();
		    }else if(document.exitFullscreen){
		        document.exitFullscreen();
		      }
		  }

	},
	//全屏进入与退出控制事件
	handleFullScreenChange : function(){
		if( !playerConfigs.isfullscreen){
			_.fullScreenBtn.addClass("exit-fullscreen");
			playerConfigs.isfullscreen = true;
			VRPlayer.setVideoContainerDim(window.screen.width, window.screen.height);
			tempCollect.progressBarWidth = parseInt(_.progressBar.getStyleValue("width"));
		}else{

			_.fullScreenBtn.removeClass("exit-fullscreen");
			playerConfigs.isfullscreen = false;
			VRPlayer.setVideoContainerDim();
			tempCollect.progressBarWidth = parseInt(_.progressBar.getStyleValue("width"));
		}
		
	},
	//设置视频尺寸大小
	setVideoContainerDim : function(width, height){

		if(platformConfigs.platform.desktop){
			playerConfigs.videoWidth = (width || 900) > 900 ? width : 900;
			playerConfigs.videoHeight = (height ||600) > 600 ? height : 600;
		}else{
			playerConfigs.videoWidth = (width || window.screen.width);
			playerConfigs.videoHeight = (height || window.screen.height);
		}                        

		_.videoContainer.setStyleValue({"width" : playerConfigs.videoWidth + "px"});
		_.videoContainer.setStyleValue({"height" : playerConfigs.videoHeight + "px"});
		
	},
	//控制PC端视频工具栏的显示与隐藏
	handleToolbarOnPC : function(evt){

		evt.preventDefault();
		evt.stopPropagation();
		var hideToolbar = function(){
			if(_.videoToolbar.hasClass("show-toolbar")){

				_.videoToolbar.removeClass("show-toolbar");
				_.videoToolbar.addClass("hide-toolbar");
				_.videoContainer.removeClass("show-cursor");
				_.videoContainer.addClass("hide-cursor");
			}
		};
		var showToolbar = function(){

			if(_.videoToolbar.hasClass("hide-toolbar")){

				_.videoToolbar.removeClass("hide-toolbar");
				_.videoToolbar.addClass("show-toolbar");
				_.videoContainer.removeClass("hide-cursor");
				_.videoContainer.addClass("show-cursor");
				
			}
		};
		if(tempCollect.timeoutId){

			clearTimeout(tempCollect.timeoutId);
			showToolbar();
		}
		tempCollect.timeoutId = setTimeout(hideToolbar, 4000);
	},
	//控制移动端视频工具栏显示与隐藏
	handleToolbarOnMobile : function(evt){

		if(_H(evt.target).hasClass("progressbar")) return;

		if(_.videoToolbar.hasClass("hide-toolbar")){
			_.videoToolbar.removeClass("hide-toolbar");
			_.videoToolbar.addClass("show-toolbar");
		}else{
			_.videoToolbar.removeClass("show-toolbar");
			_.videoToolbar.addClass("hide-toolbar");
			
		}
	},
	//控制移动端屏幕此村变化时候的控制函数
	handleResize_Mobile : function(){

		function run(){
			_.videoContainer.setStyleValue({"width" : window.screen.width + "px"});
			_.videoContainer.setStyleValue({"height" : window.screen.height + "px"});
			webGL.setCanvasSize(_.videoContainer);
		}
		setTimeout(run, 1000 / 60 );
	},
	//自动隐藏工具栏
	hideToolbarAuto :function(){

		if(_.videoToolbar.hasClass("hide-toolbar")) return;
		_.videoToolbar.addClass("hide-toolbar");
		_.videoContainer.addClass("hide-cursor");
		tempCollect.toolbar = false;
	}
};