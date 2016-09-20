//HUDSON
//TIMESTAMP:2016-07-26
//COMPANY: XIXIANG BAOAN SHENZHEN CITY GUANGDONG PROVINCE
//A SMALL LIBRARY FOR MANIPULATE HTML DOM, AND OTHER USUFUL METHOD 
//
//该模块包含了一些常用的选择器函数以及事件绑定函数，其实可以使用jquery 或者zepto.js代替，但是太过于臃肿
//
//

(function(){
//	var csskeyWord = ['height','width']
	var DEVICEW = null,
		DEVICEH = null,
		PLATFORM = {mobile:false,desktop:false},
		Hudson = {};
		Hudson = window.Hudson = _H = window._H = function(selector, context){
			// the new key word is must
			return new Hudson.fn.selector(selector, context);
			
		};
	var browserType = ['Chrome','Firefox','Safari','MSIE','Opera'];
	var browser = { 'chrome':false, 'firefox':false,'safari':false,'ie':false,'opera':false};
	//查阅CSS中的单位共有多少种
	var uintReg = /px|pt|%|rem|pi/ig;
	_H.init = function(win){
		var ua = window.navigator.userAgent;
		var regStr = /iPad|android|iPad|android|iphone|meego|Tablet|bb/ig;
			DEVICEW = window.screen.width;
			DEVICEH = window.screen.height;
		if(regStr.test(ua)){
			PLATFORM.mobile = true;
		}else{
			PLATFORM.desktop = true;
		}
		//check browser
		for(var i = 0;i<browserType.length;i++){
		  if(ua.match(RegExp(browserType[i]))){
		      browser[browserType[i].toLowerCase()] = true;
		  }else{
		   	  browser[browserType[i].toLowerCase()] = false;
		   }
		}
		this.browser = browser;
		this.PLATFORM = PLATFORM;
		this.DEVICEW = DEVICEW > DEVICEH ? DEVICEH : DEVICEW;
	};
	_H.init();

		_H.isArray = function(object){
			return Object.prototype.toString.apply(object) == "[object Array]";
		};
		_H.isFunction = function(object){
			return Object.prototype.toString.apply(object) == "[object Function]";
		};
		_H.isObject = function(object){
			return Object.prototype.toString.apply(object) == "[object Object]"
		};
		_H.toArray = function(arguments){
			var array = [];
			for(var i = 0; i < arguments.length; i++){
				array.push(arguments[i]);
			}
			//return [].slice.call(arguments); //It doesn't not work in IE 8
			return array;
	};
		_H.include = function(url){
			var head = document.head || document.getElementsByTagName('head')[0]
			var jsEle = document.createElement("script");

			jsEle.type = "text/javascript";
			jsEle.src = url;
			document.head.appendChild(jsEle);
	};
	//window.include = include;
	Hudson.fn = {
		selector : function(selector,context){

			var ctx = context || document;
			var eleTemp = [];
			if(typeof selector == "object" && !_H.isArray(selector)){
				eleTemp = [selector];
			}else if(typeof selector == "function"){
				window.addEventListener("load", selector, false);
			}else if(typeof selector == "string"){
				eleTemp = ctx.querySelectorAll(selector);
				//eleTemp = eleTemp.length !== 1 ? eleTemp : [eleTemp];
			}else if(_H.isArray(selector)){
				eleTemp = selector;
			}else{
				console.warn("Other Selector is not surrported");
			}
			this.ele = eleTemp;
			this.length = this.ele.length;
			return this;				
		},
		hasClass : function(className){
			//不允许输入数组样式的DOM
			var eleClassName = null,
				eleClassNameArr = [],
				ele = this.ele;
			if(ele.length > 1 ){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}
			if(ele.classList){
				return ele.classList.contains(className);
			}else{
				eleClassNameArr = (ele.className).split(" ");
				for(classN in eleClassNameArr){
					if(classN === className) return true;
				}
				return false;
			}
			return this;
		},
		eq : function(number){
			if(number > this.ele.length - 1){
				throw Error("Input is out  of range")
			}
			this.ele = [this.ele[index]];
			this.length = this.ele.length;
			return this;
		},
		get : function(number){
			return _H.fn.eq(number);
		},
		setAttr : function(object){
			var ele = this.ele;
			for(var i =0; i < ele.length; i++){
				for(attr in object){
					ele[i][attr] = object[attr];
				}
			}
		},
		getAttrValue : function(attribute){
			var ele = this.ele[0],
				attribute = null;
			if(/^data/ig.test(attribute)){
				attribute = attribute.replace(/^data-/,"");
				return this.dataset.attribute;
			}else{
				attribute = ele.getAttributeNode(attribute);
				return attribute.value;
			}
		},
		getStyleValue : function(attrName){
			var ele = this.ele,
				styleCollect = null;
			if(ele.length > 1){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}
			styleCollect = window.getComputedStyle(ele);
			return styleCollect[attrName];
		},
		setStyleValue : function(object){
			var ele = this.ele;
				if(ele.length > 1){
					throw TypeError("Error Input");
				}else{
					ele = (this.ele)[0];
				}
				for(attr in object){
					(ele.style)[attr] = object[attr];
				}
		},
		css : function(object){
			
			var ele = this.ele;
				for(var i = 0; i< ele.length; i++){
					for(attr in object){
						this.ele[i].style[attr] = object[attr];
					}
				}
		},
		addClass : function(className){
			var ele = this.ele;
			for(var i = 0; i < ele.length; i++){
				if(ele[i].classList){
					ele[i].classList.add(className);
				}else{
					ele[i].className = ele.className[i] + className;
				}
			}
		},
		addEventListener : function(type, callback, booleans){
			var ele = this.ele;
			for(var i = 0; i < ele.length; i++){
				ele[i].addEventListener(type,callback,booleans);
			}
		},
		removeClass : function(className){
			var eleClassNameArr = null,
				newClassNameArr = null,
				length = 0,
				ele = this.ele;
			if(ele.length > 1 ){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}
			if(ele.classList){
				ele.classList.remove(className);
			}else{
				eleClassNameArr = (ele.className).split(" ");
				for(var i = 0; i < eleClassNameArr.length; i++){
					if(eleClassNameArr[i] === className){
						eleClassNameArr.splice(i, 1);
					}
				}
				ele.className = eleClassNameArr.join(" ");
			}
		},
		hasChild : function(){
			var ele = this.ele;
			if(ele.length > 1 ){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}
			if(ele.children.length !== 0 ) return true;
			else return false; 
		},
		//dom manipulate
		remove: function(){
			var ele = this.ele;
				for(var i = 0; i < ele.length; i++){
					if(ele[i].remove){
						ele[i].remove();
					}else{
						ele[i].removeNode();
					}
				}
		},
		removeChild : function(selector){
			var ele = this.ele;
			var child ;
			if(arguments.length == 0){
				throw TypeError("parameter is not empty, one paramter is must");
			}else{
				for(var i = 0; i < ele.length; i++){
					child = ele[i].querySelectorAll(selector);
					for(var j = 0; j < child.lemgth; i++){
						child[j].remove();
					}
				}
			}
		},
		triggerEvent : function(eventName, detail){
			var ele = this.ele;
			//这个自定义事件所有的浏览器都支持
			var detail = detail || {"type" : eventName};
			//createEvent,只支持传入有限类型的参数，这些参数类型必须是浏览器所支持的
			var event = document.createEvent("CustomEvent");
				event.initCustomEvent( eventName, true, true, detail );
				for(var i = 0; i < ele.length; i++){
        			ele[i].dispatchEvent( event );					
				}
		},
		children : function(){
			var ele = this.ele;
			if(ele.length > 1 ){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}	
			return Hudson.fn.selector(_H.toArray(ele.children));
		},
		navigatorTo : function(path, hostName){
			var baseURL = hostName ||"";
			var path = path || "404.html";
			window.location.href = baseURL + path;
		},
		click : function(callback){
			var that = this;
				this.ele[0].addEventListener("click",function(){ callback(that)},false);
		},
		tap : function(callback){
			var that = this;
				this.ele[0].addEventListener("tap",function(){ callback(that)},false);
		},
		bind : function(type, callback){
			var ele = this.ele;
			for(var i = 0; i < ele.length; i++){
				if(ele[i].addEventListener){
					ele[i].addEventListener(type, callback, false);
				}else{
					ele[i].attachEvent("on" + type, callback);
				}
			}
		},
		unbind : function(type, callback){
			var ele = this.ele;
			for(var i = 0; i < ele.length; i++){
				if(ele[i].removeEventListener){
					ele[i].removeEventListener(type, callback, false);
				}else{
					ele[i].detatchEvent("on" + type, callback);
				}
			}
		},
		hide : function(){
			for(var i = 0; i < this.ele.length; i++){
				this.ele[i].style.display = "none !importance";
			}
		},
		show : function(){
			// for(var i = 0; i < this.ele.length; i++){
			// 	this.ele[i].style.d
			// }
		},
		html : function(text){
			var ele = this.ele;
			if(ele.length > 1 ){
				throw TypeError("Error Input");
			}else{
				ele = (this.ele)[0];
			}		
			if(arguments.length !== 0){
				ele.innerHTML = text;
			}else{
				return ele.innerHTML;
			}
		},
		textSubfix : function(charNum, subfix){
			var ele = this.ele;
			var processContent = function(ele,charNum, subfix){
				if(!ele) return;
				if(!ele.length){
					if(ele.hasChild) return;
					var text = ele.innerHTML;
					var subfix = charNum >= text.length ? "" : subfix;
					var charNum = charNum >= text.length ? text.length : charNum;
					var str = text.slice(0, charNum);
						for(var i = 0; i < 5 ; i++){
							str = str + subfix;
						}
						ele.innerHTML = str;
				}else{
					throw TypeError("Wrong Input Number.....");
				}
			};
			if(ele.length > 1){
				for(var i = 0 ; i < ele.length; i++){
					processContent(ele[i], charNum, subfix);
				}
			}else{
				processContent(ele[0], charNum, subfix);
			}
		}
	};
	var Util = {};
		Util.processContent = function(ele, charNum){
		};
	Hudson.fn.selector.prototype = Hudson.fn;
	//console.log("version :" + "version:" + "1.1.0" + ":" + new Date);
})()