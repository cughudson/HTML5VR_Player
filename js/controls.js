  /**
   * Controls 用来作为对外部的唯一接口
   * TimeStamp:07-07-2016
   * Author:Hudson
   * Company:WeThinkVR.CO.LTD ShenZhen City GuangDong
   *
   * lib.js is needed
   */
(function(win){
  'use strict'
  

  /**
   * The controls module is an module that contain all the class to handle the event trigger by the mouse ,touch and device or any other can trigger event for the device or DOM
   * element. the controls module contain three class as below
   *   ``MouseControls``,``TouchControls``,``DeviceControls``
   *   The module is also an alais _c or controlsInfo ,you can use the two of that to call the moudle class and function
   *
   *  ```javascript
   *  
   *      var mouseMethod = _c.MouseControls.method
   *      var touchMethod = _controlsInfo.TouchControls.method
   *      
   * ```
   * @module Controls 
   * 
   */

          /**
           * rotateX is represent the Object rotate in xaxis in local coordinate,the unit of the rotateX is radical.
           * 
           * @property rotateX
           * @default 0
           */
          var rotateX = 0,
          /**
           * rotateY is represent the Object rotate in yaxis in local coordinate,the unit of the rotatex is radical.
           * 
           * @property rotateY
           * @default 0
           */
              rotateY = 0,
          /**
           * zoomDistance is reference to the distance of the camera center to the world coordinate origin,and the distance is mapping into the range
           * between 0 and 1;
           *
           * @property zoomDistance
           * @default 0
           * @type {Number}
           */
              zoomDistance = 0,
          /**
           * deviceRotate is an quant object, and it is  represent for the rotation of the device in world coordinate
           *
           * @property  deviceRotate
           * @default  deviceRotate
           * @type {Object}
           */
              deviceRotate = quat.create(),
              lbtndown = false;
          var configs = win.platformConfigs;
          var browser = configs.platform.browser;

          var controlInfo = {"rotateX" : rotateX,"rotateY" : rotateY,"zoomDistance" : zoomDistance, "currentDeviceRotate" : deviceRotate};

          var lastPosX = null,
              lastPosY = null,
              runningId = null,
              brotateRunning = false,
              lastDistance = null;

          var version = "1.0.0";

          var timeStamp = new Date || new Date().getTime();

          var temp = version.concat(timeStamp);
          /**
           * An Class contain all of the mousecontrols method
           *
           * @class mouseControls
           * @main addMouseControls
           */

      var MouseControls = function(){

      		  var object = null;
      		  var isAvaiable = false;
            var timeOutId = null;
      		  /**
      		   * setup the mouse controls
             * ```javascript 
             *    var divObject = document.getElementsByTagName('div')[0]
             *    var mouseControl = MouseControls.addMouseControls(divObject) .
             *  ```
             * @method addMouseControls 
      		   * @param  {Object} eleObj an DOM object listener  to the mouse event
      		   * @return {null}
      		   */
              var addMouseControls = function(eleObj){

              		var eleObj = eleObj || document.documentElement;
                  /**
                   * Is an signal to show wheather the mousecontrols is in work.
                   * 
                   * @property isAvaiable
                   * @default false
                   */
              			this.isAvaiable = isAvaiable = true;
              			this.object = object = eleObj;
              			setUpMouseControls(this.object);

              };
              /**
               * The method is to alter the Object that bounding to the mousControls to obj.
               *
               * @method setListenrObject
               * @param {Object} obj an DOM Object that bounding to the mousControls
               */
              var setListenerObject = function(obj){

                    this.object = obj;
              };
              /**
               * [getListenerObject description]
               * @return {[type]} [description]
               */
              var getListenerObject = function(){

                    return this.object;
              };

              /**
               * remove all the Mouse Event Listener bounding to the DOM object.
               *
               * @method removMouseControls 
               * @return {null} 
               */
              var removeMouseControls = function(){

              		this.isAvaiable = false;
              		cancelMouseControls(this.object);
              };
              /**
               * handle mouse down event.
               *
               * @method onmousedown
               * @param  {Event} evt default parameter,an event trigger by the mouse down object
               * @return {null}
               */
              var onmousedown = function(evt){

                    evt.stopPropagation();
                    lbtndown = true;
                    lastPosX = evt.clientX;
                    lastPosY = evt.clientY;
                    if(brotateRunning){
                        controlInfo.rotateX = 0;
                        controlInfo.rotateY = 0;
                        brotateRunning = false;
                        clearInterval(runningId);
                    }
                };
                /**
                 * handle mouse up event
                 *
                 * @method onmouseup
                 * @param  {Event} evt default parameter,an event trigger by the mouse up event
                 * @return {null}    
                 */
              var onmouseup = function(evt){

                    //如果不添加stopPropagation，那么将会与界面控制click,tap事件相冲突
                    if(!brotateRunning) return;
                    evt.stopPropagation();
                    object.setStyleValue({"cursor" : "default"});
                    stopSlowly();
                };
              /**
               * handle mouse event when the mouse is stop
               *
               * @param  {Event} evt default parameter,an event trigger by the mouse stop event
               * @return {null}    
               */
              var onmovestop = function(evt){
                  if(!brotateRunning) return;
                  evt.stopPropagation();
                  stopSlowly();
              };
              /**
               * It is an common method for stop rotate slowly;
               * 
               */
              var stopSlowly = function(){
                  var endRotateX = controlInfo.rotateX,
                      endRotateY = controlInfo.rotateY,
                      flag = Math.abs(endRotateX) >= Math.abs(endRotateY) ? true : false;
                      lbtndown = false;

                  var condition = (function(){
                    if(flag){
                        return function(){return Math.abs(endRotateX);}
                    }else{
                        return function(){return Math.abs(endRotateY);}
                    }
                  })();

                  if(brotateRunning){
                      clearInterval(runningId);
                      endRotateX = controlInfo.rotateX;
                      endRotateY = controlInfo.rotateY;
                    }
                  var runningId = setInterval(function(){

                        if(condition() >= 0.0001){
                            endRotateX -= endRotateX / 2;
                            endRotateY -= endRotateY / 2;

                            controlInfo.rotateX = endRotateX;
                            controlInfo.rotateY = endRotateY;
                            brotateRunning = true;

                        }else{

                            controlInfo.rotateX = 0;
                            controlInfo.rotateY = 0;
                            brotateRunning = false;
                            clearInterval(runningId);
                        }
                    },30);
              };
                /**
                 * an method handle the mousemove event.
                 *
                 * @method onmousemove
                 * @param  {Event} evt default parameter,an event trigger by the mouse move event 
                 * @return {null}     
                 */
              var onmousemove = function(evt){

                    var target = evt.target;
                    evt.stopPropagation();
                    var delta = getMovePosInfo(evt);
                    
                    if(lbtndown){         
                        object.setStyleValue({"cursor" : "move"});
                        controlInfo.rotateX = delta.rotateX * configs.rotateRateXais;
                        controlInfo.rotateY = delta.rotateY * configs.rotateRateYais;
                        brotateRunning = true;

                    }
                    // trigger move stop event;
                    if(lbtndown){
                      if(timeOutId){
                        clearTimeout(timeOutId);
                        }
                        timeOutId = setTimeout(function(){_H(document).triggerEvent("move:stop")}, 50);
                    }
                };

              /**
               * an method handle the mouse leave event.
               *
               * @method onmouseleave
               * @param  {Event} evt default parameter,evt an event trigger by the mouse leave event 
               * @return {null}     
               */
              var onmouseleave = function(evt){

                  lbtndown = false;
                  if(brotateRunning){
                      //controlInfo.rotateX = 0;
                      //controlInfo.rotateY = 0;
                      stopSlowly();
                      clearInterval(runningId);
                    }
                };
              var onmovestop = function(evt){
                    onmouseup(evt);
              };
              /**
               * an method handle the contextmenu event.
               *
               * @method oncontextmenu
               * @param  {Event} evt default parameter, an event trigger by the contextmenu event
               * @return {null}     
               */
                /**
                 * an method handle the event when the mousewheel or DOM mousewheel event is trigger,and the
                 *
                 * @method onmousewheel
                 * @param  {[type]} evt [description]
                 * @return {[type]}     [description]
                 */
              var onmousewheel = function(evt){

                    evt.preventDefault();
                    evt.stopPropagation();
                    var delta = 0;
                    if(browser.firefox){
                        delta = -(evt.detail) * configs.mouseWheelRate ;
                    }else{
                        delta = evt.wheelDelta * configs.mouseWheelRate ;
                    }
                    if(controlInfo.zoomDistance >= 0.8) delta > 0 ? controlInfo.zoomDistance : controlInfo.zoomDistance += delta;
                    else if(controlInfo.zoomDistance <= -0.9) delta < 0 ? controlInfo.zoomDistance : controlInfo.zoomDistance += delta;
                    else if(controlInfo.zoomDistance > -0.9 && controlInfo.zoomDistance < 0.8) controlInfo.zoomDistance += delta;
                };
              /**
               * the method is to get the current position of the mouse in object coordinate.
               *
               * @method getMousePosData
               * @return {Object} an Object contain the current position of the mouse
               */
              var getMousePosData = function(){
                    return {
                      'x' : currentPosX,
                      'y' : currentPosY
                    }
                };
              var getMovePosInfo = function(evt){
                
                    var rotateX,rotateY;

                    var currentPosX = parseInt(evt.clientX);
                    var currentPosY = parseInt(evt.clientY);

                        rotateY = currentPosY - lastPosY;
                        rotateX = currentPosX - lastPosX;

                        lastPosX = currentPosX;
                        lastPosY = currentPosY;

                        return {'rotateY':rotateY,'rotateX':rotateX};
                };
              var setUpMouseControls = function(obj){
                     

                      obj.bind("mousedown", onmousedown);
                      obj.bind("mouseleave", onmouseleave);
                      obj.bind("mouseout", onmouseleave);

                      obj.bind("mousemove", onmousemove);
                      obj.bind("mousewheel", onmousewheel);        
                      obj.bind("DOMMouseScroll", onmousewheel);

                      _H(document).bind("mouseup", onmouseup);
                      _H(document).bind("move:stop", onmovestop);
                };
              var cancelMouseControls = function(obj){

                      obj.unbind("mousedown", onmousedown);
                      obj.unbind("mouseleave", onmouseleave);
                      _H(document).unbind("mouseup", onmouseup);
                      obj.unbind("mousemove", onmousemove);
                      obj.unbind("mousewheel", onmousewheel);        
                      obj.unbind("DOMMouseScroll", onmousewheel);
                      _H(document).unbind("move:stop", onmovestop);
                      
                };
            return {
                'mousedown': onmousedown,
                'mouseup': onmouseup,
                'mousemove': onmousemove,
                'mouseleave': onmouseleave,
                'mousewheel': onmousewheel,
                'movestop': onmovestop,
                'addMouseControls': addMouseControls,
                'removeMouseControls': removeMouseControls,
                'enableMouseControls': addMouseControls,
                'getMousePosData' : getMousePosData,
                'isAvaiable' : isAvaiable,
                'setListenerObject' : setListenerObject,
                'getListenerObject' : getListenerObject
            }
        };
      /**
       * TouchControls is an Class can handle all the common finger gesture such as touch, tap, or any other multitouch gesture
       *
       * @class TouchControls
       * @main addTouchControls
       */
      var TouchControls = function() {
          /**
           * Is an DOM object listener the touch or tap event.
           * 
           * @property object
           * @default documentElement
           */
          var object = null;
      		/**
           * Is an signal to show wheather the touchControls is in work.
           * 
           * @property isAvaiable
           * @default false
           */
      		var isAvaiable = false;

      		var listenerObj = null;
          /**
           * Is to add TouchControls ,and Bounding touch event to the DOM element specify by the user.
           *
           * @method addTouchControls
           * @param {Object} eleObj An object which  Touch or Tap Event bounding to .
           */
      		var addTouchControls = function(eleObj){

      			var eleObj = eleObj|| document.documentElement;
      				this.isAvaiable = isAvaiable = true;
      				this.object = object = eleObj;
      				listenerObj = eleObj;
      				setUpTouchControls(this.object);
      		};
          /**
           * Is remove the bounding to the object specify using addTouchControls method by the user
           *
           * @method removeTouchControls
           * @return {null} 
           */
      		var removeTouchControls = function(){

      				isAvaiable = false;
      				cancelTouchControls(this.object);
      		};
          /**
           * The method is use to set an DOM element to bounding to the touch or tap event listener
           *
           * @method setListenerObject
           * @param {Object} obj an object bounding to the touch or tap event
           */
          var setListenerObject = function(obj){
                this.object = obj;
          };
          /**
           * The method is use to get current DOM element to bounding to the touch or tap event listener
           *
           * @method getListenerObject
           * @return {Object} An DOM Object that current bounding to the touch or tap Event
           */
          var getListenerObject = function(){

              return this.object;
          };
          /**
           * An method handle the event when multitouch is start.
           *
           * @method onmultitouchstart
           * @param  {Event} evt an event object
           * @return {[null}     
           */
          var onmultitouchstart = function(evt){
                  var touch1,touch2;
                  if(evt.targetTouches.length == 2){
                      touch1 = evt.targetTouches[0];
                      touch2 = evt.targetTouches[1];
                      lastDistance = getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
                  }
              };
          /**
           * An method handle the event when multitouch is move   .
           *
           * @method onmultitouchstart
           * @param  {Event} evt an event object
           * @return {[null}     
           */
          var onmultitouchmove = function(evt){

                  var distance,delta,touch1,touch2;
                      evt.preventDefault();
                      evt.stopPropagation();
                  // 仅处理两根手指的情况，当只有两根手指的时候为缩放场景;
                  if(evt.targetTouches.length == 2){
                      touch1 = evt.targetTouches[0];
                      touch2 = evt.targetTouches[1];

                      distance = getDistance(touch1.clientX,touch1.clientY,touch2.clientX,touch2.clientY);
                      delta = (distance - lastDistance) / 500.0;

                      if(controlInfo.zoomDistance > 0.8) delta > 0 ? controlInfo.zoomDistance : controlInfo.zoomDistance += delta;
                      else if(controlInfo.zoomDistance < -0.9) delta < 0 ? controlInfo.zoomDistance : controlInfo.zoomDistance += delta;
                      else if(controlInfo.zoomDistance > -0.9 && controlInfo.zoomDistance < .8) controlInfo.zoomDistance += delta;

                      lastDistance = distance;  
                  }
              };
          /**
           * An method handle the event when the Muiti touch or tap event is end.
           *
           * @method onmultitouchend
           * @param  {Event} evt An event object
           * @return {null}   
           */
          var onmultitouchend = function(evt){

                  if(evt.targetTouches.length !== 2){
                      return;
                  }
              };
          var getDistance = function(x1, y1, x2, y2){

          	    var distance = Math.sqrt((Math.pow(x1 - x2 , 2) + Math.pow(y1 - y2 , 2)));
                return distance;
              };
          var getTouchPosInfo = function(evt){

                  var currentPosX,currentPosY,rotateX,rotateY;
                  if(evt.targetTouches){
                      if(evt.targetTouches.length == 1){
                          currentPosX = parseInt(evt.targetTouches[0].clientX);
                          currentPosY = parseInt(evt.targetTouches[0].clientY);
                      }
                          rotateX = currentPosX - lastPosX;
                          rotateY = currentPosY - lastPosY;

                      lastPosX = currentPosX;
                      lastPosY = currentPosY;

                      return {'rotateY':rotateY ,'rotateX':rotateX};
                  }
              };
          /**
           * An method handle the event when the  touch or tap event is start. and it is use for just one finger.
           *
           * @method ontouchstart
           * @param  {Event} evt An event object
           * @return {null}   
           */
          var ontouchstart = function(evt){

                  lbtndown = true;
                  if(evt.targetTouches.length == 1){
                        lastPosX = evt.targetTouches[0].clientX;
                        lastPosY = evt.targetTouches[0].clientY;
                    }else if(evt.targetTouches.length == 2){

                        onmultitouchstart(evt);
                    }
                    if(brotateRunning){
                        if(evt.targetTouches.length == 1 || evt.targetTouches.length == 2){
                            controlInfo.rotateX = 0
                            controlInfo.rotateY = 0;
                            brotateRunning = false;
                            clearInterval(runningId);
                        }
                    }
              };
          /**
           * An method handle the event when the  touch or tap event is mouse. and it is use for just one finger.
           *
           * @method  ontouchmove
           * @param  {Event} evt An event object
           * @return {null}   
           */
          var ontouchmove = function(evt){

                  evt.preventDefault();
                  var delta = getTouchPosInfo(evt);
                  if(lbtndown){
                      //maybe has something TOdo
                      if(evt.targetTouches.length == 2){
                          onmultitouchmove(evt)
                      }else if(evt.targetTouches.length == 1){
                          controlInfo.rotateX = delta.rotateX * configs.rotateRateXais;
                          controlInfo.rotateY = delta.rotateY * configs .rotateRateYais;
                      }
                  }
              };
          /**
           * An method handle the event when the  touch or tap event is end. and it is use for just one finger.
           *
           * @method  ontouchend
           * @param  {Event} evt An event object
           * @return {null}   
           */
          var ontouchend = function(evt){

                  var endRotateX = controlInfo.rotateX,
                      endRotateY = controlInfo.rotateY,
                      flag = Math.abs(endRotateX) >= Math.abs(endRotateY) ? true : false;
                      lbtndown = false;

                  var condition = (function(){

                      if(flag){
                          return function(){return Math.abs(endRotateX);}
                      }else{
                          return function(){return Math.abs(endRotateY);}
                      }
                    })();
                  if(brotateRunning){

                      clearInterval(runningId);
                      endRotateX = controlInfo.rotateX;
                      endRotateY = controlInfo.rotateY;

                    }
                  var runningId = setInterval(function(){

                        if(condition() >= 0.0001){
                            endRotateX -= endRotateX / 4;
                            endRotateY -= endRotateY / 4;

                            controlInfo.rotateX = endRotateX;
                            controlInfo.rotateY = endRotateY;
                            brotateRunning = true;

                        }else{

                            controlInfo.rotateX = 0;
                            controlInfo.rotateY = 0;
                            brotateRunning = false;
                            clearInterval(runningId);
                        }
                    },30);
              };

          var setUpTouchControls = function(obj){

                  obj.bind("touchstart", ontouchstart);
                  obj.bind("touchmove", ontouchmove);
                  obj.bind("touchend", ontouchend);
              };

          var cancelTouchControls = function(obj){

                  obj.unbind("touchstart", ontouchstart);
                  obj.unbind("touchmove", ontouchmove);
                  obj.unbind("touchend", ontouchend);
              };
          return {
            'ontouchstart':ontouchstart,
            'ontouchmove':ontouchmove,
            'ontouchend':ontouchend,
            'addTouchControls':addTouchControls,
            'removeTouchControls':removeTouchControls,
            'isAvaiable' : isAvaiable,
            'setListenerObject' : setListenerObject,
            'getListenerObject' : getListenerObject
          }
      };
      /**
       * An class that use for handle the groyscope senser data;
       * 
       * @class DeviceControls
       */
      var DeviceControls = function(){
      	 
         /**
          *  It is an signal use for detemine wheather the deviceControls is in works
          *
          * @property isAvaiable
          * @type {Boolean}
          * @default false
          */
          var isAvaiable = false,
              device = {},

              /**
               *  It is use for to set the sentive of the gyrosocpe senser, the more bigger of the number , the more sensitive of the gyroscope in the device.
               *
               * @property isAvaiable
               * @default 0.5
               * @type {Number}
               * 
               */
              sensitive = 0.5;
          var isDisable = false;
          var alpha = null,
              invertQuat = quat.create(),
              gamma = null,
              beta = null;

              device.alpha = alpha;
              device.gamma = gamma;
              device.beta = beta;
          /**
           * Add the device controls to the thing of you device, when you device have no gyroscope or addDeviceControls fail, it will throw an Custion Error: DeviceError
           *
           * @method addDeviceControl
           * 
           */
          var create = function(){

              return this;

          }
          var addDeviceControls = function(){
              var that = this;
              controlInfo.currentDeviceRotate  = quat.create();
             // _H(window).bind('deviceorientation', getOrientationData);
              window.addEventListener('deviceorientation', getOrientationData, false);
          };
          var getOrientationData = function(orientation){

              if(isDisable) return;
              alpha = orientation.alpha;//orientation.alpha;
              gamma = orientation.gamma;
              beta = orientation.beta;
              
              deviceFromDeviceQuat();
          };
          /**
           * Convert the orientation rotate angle in x, y, z angle to an quatation with four item.
           *
           * @method quatFromDeviceQrient
           * @return {Object} An quatation contain the rotation info of the device
           */
          var quatFromDeviceOrient = function(){

              var z = alpha * util.degToRad * sensitive;
              var x = beta * util.degToRad * sensitive;
              var y = gamma * util.degToRad * sensitive;

              var cX = Math.cos(x),
                  cY = Math.cos(y),
                  cZ = Math.cos(z),
                  sX = Math.sin(x),
                  sY = Math.sin(y),
                  sZ = Math.sin(z);

              var w = cX * cY * cZ - sX * sY * sZ,
                  x = sX * cY * cZ - cX * sY * sZ,
                  y = cX * sY * cZ + sX * cY * sZ,
                  z = cX * cY * sZ + sX * sY * cZ;

              return quat.fromValues(x, y, z, w);
                  
          };
          /**
           * created quatation with screen rotation corrected
           *
           * @method deviceFromDeviceQuat
           * @return {null} 
           */
          var deviceFromDeviceQuat = function(){

              if(!playerConfigs.enableorientation){
                return quat.create(0, 0, 0, 1);
              }
              var deviceQuat = quatFromDeviceOrient();
              var screenOrientation = (util.getScreenOrientation() * util.degToRad) / 2;
              var screenTransform = [0, 0, -Math.sin(screenOrientation), Math.cos(screenOrientation)];
              quat.multiply(controlInfo.currentDeviceRotate, deviceQuat, screenTransform);
              var r22 = Math.sqrt(0.5);
              quat.multiply(controlInfo.currentDeviceRotate, quat.fromValues(-r22, 0, 0, r22), controlInfo.currentDeviceRotate);
             // controlInfo.currentDeviceRotate = quat.invert(invertQuat, controlInfo.currentDeviceRotate);
          };
          var isAvaiable = function(){
              if(alpha){
                throw TypeError("You device is not support deviceorientation ");
              }
          };
          // devicedeviceRotation is the quaternion encoding of the transformation
          // from camera coordinates to world coordinates.  The problem is that
          // our shader uses conventional OpenGL coordinates
          // (+x = right, +y = up, +z = backward), but the DeviceOrientation
          // spec uses different coordinates (+x = East, +y = North, +z = up).
          // To fix the mismatch, we need to fix this.  We'll arbitrarily choose
          // North to correspond to -z (the default camera direction).
          
          /**
           * remove the device controls of the device.
           *
           * @method removeDeviceControls
           * @return {null} 
           */
          var removeDeviceControls = function(){

              isDisable = true;
              _.win.unbind('deviceorientation', getOrientationData);

          };
          /**
           * It to is disable the controls of the device, it is an alais of the removeDeviceControls.
           *
           * @method disableDeviceControls
           * @return {null} 
           */
          var disableDeviceControls = function(){

              removeDeviceControls();
          }
          /**
           * It is use to add the device controls to the device
           *
           * @method enableDeviceControls
           * @return {null} 
           */
          var enableDeviceControls = function(){

              isDisable = false;
              _.win.bind('deviceorientation', getOrientationData);
          }
          //the interface of the device controls
          return {

              'create' : create,
              'addDeviceControls': addDeviceControls,
              'removeDeviceControls': removeDeviceControls,
              'enableDeviceControls' : enableDeviceControls,
              'disableDeviceControls' : disableDeviceControls,
              'isDisable' : isDisable,
              'isAvaiable': isAvaiable,
              'sensitive':sensitive

          }
      };

      var _c = {}, Controls;
      	  _c.mouseControls = MouseControls();
     	    _c.touchControls = TouchControls();
      	  _c.deviceControls = DeviceControls();
     	    win._c = _c;

     	    win.controlInfo = controlInfo;
          win.Controls = Controls = win._c

})(window)