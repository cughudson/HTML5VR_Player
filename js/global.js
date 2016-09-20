
/**
 * Gloable Package it is use for init the GlobalConfig Object
 * Timestamp:207-07-2016
 * Author: Hudson
 * Company:WethinkVR at XiXiang ShenZhen City;
 */
(function(){
  var platformConfigs = {},
      mouseWheelRate,
      rate,
      rotateRateXais = 0,
      rotateRateYais = 0,
      hasFlash = null,
      flashVersion = null,
      videoContainer = undefined,
      video = undefined;

  var browserType = ['Chrome','Firefox','Safari','MSIE','Opera'];
  var rootEle = document.documentElement,
      platform = {
          "desktop":false,
          "mobile":false,
          "mobileflatform":
              {
                "android":false,
                "ios":false,
                "wechat":false
              },
          "browser":
              {
                'chrome':false,
                'firefox':false,
                'safari':false,
                'ie':false,
                'opera':false
              }
      },
      UAStr = navigator.userAgent,
      SIGNAL = 0.03125;
      var checkPlatform = function(){

          /**
           * 
           * 检测browser的类型
           */
          for(var i = 0;i<browserType.length;i++){
            if(UAStr.match(RegExp(browserType[i]))){
              platform.browser[browserType[i].toLowerCase()] = true;
            }else{
              platform.browser[browserType[i].toLowerCase()] = false;
             }
          }
          /*
           * 检测是位于移动端还是PC端还是移动端的WeChat上面
           */
          if(UAStr.match(/iPad|android|android|iphone|meego|Tablet|bb|Phone/ig)){
              platform.mobile = true;
              if(UAStr.match(/Android/ig)){
                  platform.mobileflatform.android = true;
              }else if(UAStr.match(/iPad|iPhone/ig)){
                   platform.mobileflatform.ios = true;
              }else{
                  console.warn("unknow device type");
              }
              if(UAStr.match(/micromessenger/ig)){
                  platform.mobileflatform.wechat = true;
              }
          }else{
              platform.desktop = true;
          }
      };
      /**
       * 设置鼠标滚轮的滚动比例，不同的浏览器滚动比例是不一样的
       * @return {[type]} [description]
       */
      var getMouseWheelRate = function(){
        if(platform.browser.firefox){
            mouseWheelRate = 0.01;
            rate = 0.8;
        }else{
            mouseWheelRate = 0.00024;
            rate = 1;
        }
      };
      var setRotateRate = function(){
        if(platform.desktop){
            rotateRateYais = Math.PI/window.innerWidth;
            rotateRateXais = Math.PI/window.innerHeight;
        }else{
            rotateRateYais = 0.2*Math.PI/window.innerWidth;
            rotateRateXais = 0.2*Math.PI/window.innerHeight;
        }
      };
      /**
       * 检测是否支持flash，以及平台所安装flash的版本
       * @return {[type]} [description]
       */
      var supportFlash = function(){
          if (document.all) {
            var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (swf) {
                hasFlash = true;
                VSwf = swf.GetVariable("$version");
                flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
              }else{
                hasFlash = false;
                flashVersion = undefined;
            }
          } else {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins["Shockwave Flash"];
                if (swf) {
                    hasFlash = true;
                    var words = swf.description.split(" ");
                    for (var i = 0; i < words.length; ++i) {
                        if (isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);
                        }
                    }else{
                        hasFlash = false;
                        flashVersion = undefined;
                  }
              }
          }
      };
      //运行函数获取程序运行所必须的初始化参数；
      
      checkPlatform();
      getMouseWheelRate();
      setRotateRate();
      supportFlash();

      platformConfigs.platform = platform;
      platformConfigs.rotateRateYais = rotateRateYais;
      platformConfigs.rotateRateXais = rotateRateXais;
      platformConfigs.flashVersion = flashVersion;
      platformConfigs.hasFlash = hasFlash;
      platformConfigs.mouseWheelRate = mouseWheelRate;
      platformConfigs.rate = rate;

      platformConfigs.videoContainer = videoContainer;
      platformConfigs.video = video;

      window.platformConfigs =platformConfigs;
      
})();