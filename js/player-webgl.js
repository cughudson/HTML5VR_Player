
/**
 * @Author Hudson
 * @Company： XiXiang BaoAn Distrit Shenzhen City GuangDong Province
 * @Time 2016-09
 * including gl-matrix.js library
 */
/**
 * The Module is use for render webGL VRPlayer ViewPort or Scene
 */
/*globals PhoneVR,canvas,:false*/
/*globals window*/
  'use strict';
(function(global) {
  var perspectiveMatrix = mat4.create();
  var webGL = { 
    gl: null,
    canvas:null,
    tempPara:{
      lonCurrent : 0,
      latCurent : 0,
      lonLast : 0,
      latLast : 0
    },
    isAvaiable : false,
    texture : null,
    buffer : {
      "positionsBuffer" : null,
      "verticesIndexBuffer" : null,
      "textureCoordBuffer" : null,
      "normalBuffer" : null   
    },
    modelViewMatrix : mat4.create(),
    projectionMatrix : perspectiveMatrix,
    /*
     * the default fragmentShader and Vertex Shader
     */
    defaultfragmentShaderScript : 'precision mediump float;\n' +
                                'varying vec2 textureCoord;\n' +
                                'uniform sampler2D uSampler;\n' +
                                'void main(void) {\n' +
                                        'vec4 textureColor = texture2D(uSampler, vec2(textureCoord.s, textureCoord.t));\n' +
                                        'gl_FragColor = vec4(textureColor.rgb, textureColor.a);\n' + 
                                  '}',
    defaultVextexShaderScript :  'attribute vec2 aTextureCoord;\n' +
                                 'attribute vec3 aVertexPosition;\n' +
                                 'uniform mediump mat4 modelViewMatrix;\n' +
                                 'uniform mediump mat4 projectMatrix;\n' +
                                 'varying highp vec2 textureCoord;\n' +
                                  'void main(void) {\n' +
                                        'gl_Position = projectMatrix * modelViewMatrix * vec4(aVertexPosition * vec3(1.05,1,1), 1.0);\n' +
                                        'textureCoord = aTextureCoord;\n' +
                                     '}',  
    //  
    /**
     * Get the drawing context of webGL  
     * @param  {Object} canvasContainer the contaner of the canvas tag, aka the drawing context
     * @return {object} the drawing context
     */
    getContext : function(canvasContainer){
        var gl,ratio;
        var canvasContainer = canvasContainer.ele[0];
        if(canvasContainer.nodeName !== 'DIV') return;
        var canvas = document.createElement('canvas');
        this.canvas = canvas;
        try{
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          }catch(e){
            console.error("can not create webGL context");
            return;
          }
        if(gl){
              var devicePixelRatio = window.devicePixelRatio || 1;
              var backingStoreRatio = gl.webkitBackingStorePixelRatio ||
                                      gl.mozBackingStorePixelRatio ||
                                      gl.msBackingStorePixelRatio ||
                                      gl.oBackingStorePixelRatio ||
                                      gl.backingStorePixelRatio || 1;

              this.ratio = devicePixelRatio / backingStoreRatio;
              var canvasContainerStyle = window.getComputedStyle(canvasContainer);
                  canvas.style.height = canvasContainerStyle.height;
                  canvas.style.width = canvasContainerStyle.width;

                  canvas.height = parseInt(canvasContainerStyle.height) * this.ratio ;
                  canvas.width = parseInt(canvasContainerStyle.width) * this.ratio;
                  canvasContainer.appendChild(canvas);
                  gl.clearColor(1.0, 1.0, 1.0, 0.6);
                  gl.enable(gl.DEPTH_TEST);
                  gl.viewport(0, 0, playerConfigs.videoWidth, playerConfigs.videoHeight);
                  return gl;
          }
    },
    initWebGL : function(canvasContainer) {
        this.gl = this.getContext(canvasContainer)
    },
    /**
     * Detect Whether the WebGL is avaiable on the device
     * @return {null} 
     */
    checkWebGL : function(){

        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if(gl) this.isAvaiable = true;
            else this.isAvaiable = false; 
    },
    /**
     * Set the drawing context size , or canvas size
     * @param  {Object} canvasContainer the contaner of the canvas tag, aka the drawing context
     */
    setCanvasSize : function(canvasContainer){
        var gl = this.gl;
        var canvasContainerStyle = window.getComputedStyle(canvasContainer.ele[0]);
            this.canvas.style.height = canvasContainerStyle.height;
            this.canvas.style.width = canvasContainerStyle.width;

            this.canvas.height = parseInt(canvasContainerStyle.height) * this.ratio ;
            this.canvas.width = parseInt(canvasContainerStyle.width) * this.ratio;
    },
    getPhoneVR: function() {
      if (!webGL.phoneVR) {
        webGL.phoneVR = new PhoneVR();
      }
      return webGL.phoneVR;
    },
    /**
     * To Construct the sphere, where the video material to mapping into
     * @param {Number} radius   The radius of the sphere
     * @param {Number} segmentX the segment of the sphere divide in x axis
     * @param {Number} segmentY the segment of the sphere divide in y axis
     */
    setSphereParameter:function(radius,segmentX,segmentY){

        var normalDatas = [];
        var vertexPositionData = [];
        var textureCoordData = [];
        var sphereVertexIndex = [],
            seguemtNum_lat = seguemtNum_lat,
            seguemtNum_lon = seguemtNum_lon;
        var theta,sinTheta,cosTheta,phi,sinPhi,cosPhi,x,y,z,u,v,first,second;

        for (var xNumber = 0; xNumber <= segmentX; xNumber++) {
              theta = xNumber * Math.PI / segmentX;
              sinTheta = Math.sin(theta);
              cosTheta = Math.cos(theta);
          for (var yNumber = 0; yNumber <= segmentY; yNumber++) {
                phi = yNumber * 2 * Math.PI / segmentY;
                sinPhi = Math.sin(phi);
                cosPhi = Math.cos(phi);
                x = -cosPhi * sinTheta;
                y = -cosTheta;
                z = -sinPhi * sinTheta;
                u = yNumber / segmentY;
                v = xNumber / segmentX;

                textureCoordData.push(u);
                textureCoordData.push(v);

                normalDatas.push(x);
                normalDatas.push(y);
                normalDatas.push(z);

                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
            }
        }
        for (var xNumber=0; xNumber < segmentX; xNumber++) {
            for (var yNumber=0; yNumber < segmentY; yNumber++) {
              // segmentNum_lon is a circle;
              first = (xNumber * (segmentY + 1)) + yNumber;
              second = first + segmentY + 1;

              sphereVertexIndex .push(first);
              sphereVertexIndex .push(second);
              sphereVertexIndex .push(first + 1);
              sphereVertexIndex .push(second);
              sphereVertexIndex .push(second + 1);
              sphereVertexIndex .push(first + 1);
          }
        }
          return {'sphereObjData':vertexPositionData,'sphereVertexIndex':sphereVertexIndex,'textureCoordData':textureCoordData,'normalDatas':normalDatas};
      },
    /**
     * Init the buffer of the webgl to display
     * @return {null} 
     */
    initBuffers: function() {

      var sphereObj =webGL.setSphereParameter(1, 50, 50);

      var positions = sphereObj['sphereObjData'];
      var vertexIndices = sphereObj['sphereVertexIndex'];
      var textureCoordData = sphereObj['textureCoordData'];
      var normalDatas = sphereObj['normalDatas'];

      this.buffer.normalBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer.normalBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(normalDatas),this.gl.STATIC_DRAW);
      this.buffer.normalBuffer.itemSize = 3;
      this.buffer.normalBuffer.numItems = normalDatas.length/3;

      this.buffer.positionsBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.positionsBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
      this.buffer.positionsBuffer.itemSize = 3;
      this.buffer.positionsBuffer.numItems = positions.length/3;

      this.buffer.textureCoordBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.textureCoordBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordData), this.gl.STATIC_DRAW);
      this.buffer.textureCoordBuffer.itemSize = 2;
      this.buffer.textureCoordBuffer.numItems = textureCoordData.length / 2;

      this.buffer.verticesIndexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer.verticesIndexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(vertexIndices), this.gl.STATIC_DRAW);
      this.buffer.verticesIndexBuffer.itemSize = 1;
      this.buffer.verticesIndexBuffer.numItems = vertexIndices.length;

    },
    /**
     * init the texture
     * 
     */
    initTextures: function() {

        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    },
    /**
     * update the texture
     * @param  {video} material the video which you want to mapping into the sphere
     * @return {null}      
     */
    updateTexture: function(material) {

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, material);
      
      },
    getShaderByShaderType : function(shaderType){
          var theSource = null,
              result = null;
          if(shaderType !=="fragmentShader" && shaderType !== "vertexShader"){
              
              throw new TypeError("Unknow shader type");
          
          }
          if (shaderType === "fragmentShader") {
                  result = webGL.gl.createShader(webGL.gl.FRAGMENT_SHADER);
                  theSource = webGL.defaultfragmentShaderScript;
              }else if (shaderType === "vertexShader") {
                  result = webGL.gl.createShader(webGL.gl.VERTEX_SHADER);
                  theSource = webGL.defaultVextexShaderScript;
              }else {
                  return null;  
          }
          
          webGL.gl.shaderSource(result, theSource);
          webGL.gl.compileShader(result);

          if (!webGL.gl.getShaderParameter(result, webGL.gl.COMPILE_STATUS)) {
              alert("An error occurred compiling the shaders: " + webGL.gl.getShaderInfoLog(result));
              return null;
          }
          return result;
      },
    initShader: function(params) {

      // shader use process/create process: createShader --> shaderSource --> CompileShader;
      // mapping in program  createProgram --> attachShader --> linkProgram --> useProgram;
      // get a shader program ready and going: CreateProgram --> attachShader(vertex shader)-->attachShader(fragment shader) --> linkProgram --> useProgram       
      
      this.params = params;     
      this.fragmentShader = this.getShaderByShaderType("fragmentShader");
      this.vertexShader = this.getShaderByShaderType("vertexShader");

      this.program = webGL.gl.createProgram();   
      webGL.gl.attachShader(this.program, this.vertexShader);
      webGL.gl.attachShader(this.program, this.fragmentShader);    
      webGL.gl.linkProgram(this.program);
      if (!webGL.gl.getProgramParameter(this.program, webGL.gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + webGL.gl.getProgramInfoLog(this.program));
      }
      webGL.gl.useProgram(this.program);
      this.attributes = {};
      for (var i = 0; i < this.params.attributes.length; i++) {
          var attributeName = this.params.attributes[i];
          this.attributes[attributeName] = webGL.gl.getAttribLocation(this.program, attributeName);
          webGL.gl.enableVertexAttribArray(this.attributes[attributeName]);
      }
      this.uniforms = {};
      for (i = 0; i < this.params.uniforms.length; i++) {
          var uniformName = this.params.uniforms[i];
          this.uniforms[uniformName] = webGL.gl.getUniformLocation(this.program, uniformName);
          webGL.gl.enableVertexAttribArray(this.attributes[uniformName]);
      }
    },
    /**
     * push the data such vertex, vertex index  texture, projectMatrix, modelViewMatrix data to GPU, and drawing the data to the webGL canvas
     * @return {null} 
     */
    pushData2GPU : function(){

            this.gl.useProgram(webGL.program);

            this.gl.bindBuffer(webGL.gl.ARRAY_BUFFER, this.buffer.textureCoordBuffer);
            this.gl.vertexAttribPointer(this.attributes['aTextureCoord'], this.buffer.textureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.positionsBuffer);
            this.gl.vertexAttribPointer(this.attributes['aVertexPosition'], this.buffer.positionsBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.uniform1i(this.uniforms['uSampler'], 0);

            this.gl.bindBuffer(webGL.gl.ELEMENT_ARRAY_BUFFER, this.buffer.verticesIndexBuffer);
            this.gl.uniformMatrix4fv(this.uniforms['projectMatrix'], false, this.projectionMatrix);
            this.gl.uniformMatrix4fv(this.uniforms['modelViewMatrix'], false, this.modelViewMatrix);   
            this.gl.drawElements(this.gl.TRIANGLES, this.buffer.verticesIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
    
    },
    /**
     * update the matrix of the transform matrix
     */
    updateMatrix: function() {

            var totalRotationInQuat = quat.create();
            var totalRotationInMatrix = mat4.create();
            var deviceRotate = quat.create();
            var mouseRotate = quat.create();

            var quatX   = quat.create();
            var quatX_0 = quat.create();
            var quatX_1 = quat.create();
            var quatY   = quat.create();
            var quatY_0 = quat.create();
            var quatY_1 = quat.create();

            var translateVec = vec3.clone([0, 0, controlInfo.zoomDistance * 1]);

            quat.multiply(deviceRotate, [0,0,0,1], controlInfo.currentDeviceRotate);
            
            mat4.identity(webGL.modelViewMatrix);
            mat4.translate(webGL.modelViewMatrix, webGL.modelViewMatrix, translateVec);

            this.tempPara.latCurrent = this.tempPara.latLast + controlInfo.rotateY * 2 ;
            this.tempPara.lonCurrent = this.tempPara.lonLast + controlInfo.rotateX * 2;
            // 将视角控制在-72度到72度之间;
            this.tempPara.latCurrent = Math.max(-72 * util.degToRad, Math.min(72 * util.degToRad, this.tempPara.latCurrent));

            quat.rotateX(quatX_0, quatX_0, -this.tempPara.latLast);
            quat.rotateX(quatX_1, quatX_1, -this.tempPara.latCurrent);
            quat.rotateY(quatY_0, quatY_0, -this.tempPara.lonLast);
            quat.rotateY(quatY_1, quatY_1, -this.tempPara.lonCurrent);

            // //quat sherp inteploate and smooth rotate of the object rotation.
            quat.slerp(quatX, quatX_1, quatX_0, 0.01);
            quat.slerp(quatY, quatY_1, quatY_0, 0.01);

            quat.multiply(mouseRotate, quatX, quatY);
            quat.multiply(totalRotationInQuat, deviceRotate, mouseRotate);

            mat4.fromQuat(totalRotationInMatrix, totalRotationInQuat);
            mat4.multiply(webGL.modelViewMatrix, webGL.modelViewMatrix, totalRotationInMatrix);
           
            this.tempPara.latLast = this.tempPara.latCurrent;
            this.tempPara.lonLast = this.tempPara.lonCurrent; 

    },
    /**
     * [drawEye description]
     * @param  {Number} x       the topleft corner's x item of the canvas reference to the screen
     * @param  {Number} y       the topleft corner's y item of the canvas reference to the screen
     * @param  {Number} width   the width of the canvas
     * @param  {Number} height  the height of the canvas
     * @param  {Number} eyeType the eyeType of the VR Player, 0 is reference to left eye, 1 is reference to right eye and 2 is reference to screen just have one eye
     * @return {null}        
     */
  drawEye : function(x, y, width, height,eyeType){
      this.pushData2GPU(this);
      if(eyeType == 0){
          this.gl.viewport(x, y, width, height);
        }else if(eyeType == 1){
          this.gl.viewport(x, y, width, height)
        }else if(eyeType == 2){
          this.gl.viewport(x, y, width, height)
        }else{
          throw new TypeError("unknow eye type");
        }

    }
};
  global.webGL = webGL;
  webGL.checkWebGL();
})(window);
