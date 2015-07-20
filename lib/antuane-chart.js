/*!
* didioChart.js
* http://antuane.com/
* Version: 1.0.0
*
* Copyright 2015 Diógenes Silveira
* Released under the MIT license
* https://github.com/antuane/
*/

'use strict';

function AntuaneHelper(){

  this.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  this.wrapText = function(context, text, x, y, maxWidth, lineHeight) {
    var cars = text.split("\n");

    for (var ii = 0; ii < cars.length; ii++) {

      var line = "";
      var words = cars[ii].split(" ");

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;

        if (testWidth > maxWidth) {
          context.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
        }
        else {
          line = testLine;
        }
      }

      context.fillText(line, x, y);
      y += lineHeight;
    }
  }

  this.colorLuminance = function(hex, lum) {
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  }

  this.cloneObj = function(obj) {
    if(obj == null || typeof(obj) != 'object')
    return obj;

    var temp = obj.constructor();

    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        temp[key] = cloneObj(obj[key]);
      }
    }
    return temp;
  }

  this.getObjById = function(listObj, idObj){
    for(var i = 0; i < listObj.length; i++){
      if(listObj[i].id ==  idObj){
        return listObj[i];
      }
    }
    return null;
  }

  this.trackTransforms = function(ctx){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function(){ return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
      savedTransforms.push(xform.translate(0,0));
      return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function(){
      xform = savedTransforms.pop();
      return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
      xform = xform.scaleNonUniform(sx,sy);
      return scale.call(ctx,sx,sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
      xform = xform.rotate(radians*180/Math.PI);
      return rotate.call(ctx,radians);
    };
    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
      xform = xform.translate(dx,dy);
      return translate.call(ctx,dx,dy);
    };
    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
      var m2 = svg.createSVGMatrix();
      m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
      xform = xform.multiply(m2);
      return transform.call(ctx,a,b,c,d,e,f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
      xform.a = a;
      xform.b = b;
      xform.c = c;
      xform.d = d;
      xform.e = e;
      xform.f = f;
      return setTransform.call(ctx,a,b,c,d,e,f);
    };
    var pt  = svg.createSVGPoint();
    ctx.transformedPoint = function(x,y){
      pt.x=x; pt.y=y;
      return pt.matrixTransform(xform.inverse());
    }
  };
}


function AntuaneChart(data) {
  this.init(data);
  console.log(this);


}

AntuaneChart.prototype.init = function(data){

  var helper = new AntuaneHelper();
  //try{
  //this.diagrams = data.diagrams;
  //this.links = data.links;
  //this.config = data.config;

  this.canvas = document.getElementById(data.config.element);

  if(this.canvas){
    this.context = this.canvas.getContext("2d");
  }else{
    throw "Element not found"
  }

  this.context = this.canvas.getContext("2d");

  helper.trackTransforms(this.context);

  if(data.config.autoSize){
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = this.canvas.parentNode.clientHeight;
  }

  // }
  // catch(error){
  //   console.log("Error: " + error);
  //
  // }

  var diagramList = [];
  var diagramLinesCount = [];
  var diagramColumnsCount = 0;
  var diagramColumnLower = 0;

  for(var i = 0; i < data.diagrams.length; i++){

    var objectDiagram = {
      id: data.diagrams[i].id,
      x: 0,
      y: 0,
      cx: 0,
      cy: 0,
      text: data.diagrams[i].text,
      color: data.diagrams[i].color,
      bgColor: data.diagrams[i].bgColor,
      parents: [],
      children: [],
      virgin: true,
      orphan: true,
    }

    for(var j = 0; j < data.links.length; j++){

      if(data.links[j].source == objectDiagram.id){
        objectDiagram.parents.push(data.links[j].parent);
        objectDiagram.orphan = false;
      }

      if(data.links[j].parent == objectDiagram.id){
        objectDiagram.children.push(data.links[j].source);
        objectDiagram.orphan = false;
      }

    }

    diagramList.push(objectDiagram);
  }



  var getLinesObjects = function getLinesObjects(object, hierarchy){
    if(object.virgin){
      object.virgin = false;
      object.y = hierarchy;

      if(hierarchy < diagramColumnLower){
        diagramColumnLower = hierarchy;
      }

      for(var i = 0; i < object.children.length; i++){
        var tmpObj = helper.getObjById(diagramList, object.children[i]);
        getLinesObjects(tmpObj, hierarchy + 1);
      }

      for(var i = 0; i < object.parents.length; i++){
        var tmpObj = helper.getObjById(diagramList, object.parents[i]);
        getLinesObjects(tmpObj, hierarchy - 1);
      }
    }
  }

  for(var i = 0; i < diagramList.length; i++){
    getLinesObjects(diagramList[i], 0);
  }

  //GET OBJECTS COLUMNS
  for(var i = 0; i < diagramList.length; i++){
    var countObjTmp = helper.getObjById(diagramLinesCount, diagramList[i].y);
    if(countObjTmp != null){
      if(!diagramList[i].orphan){
        countObjTmp.count++;
        diagramList[i].x = countObjTmp.count;
        if(countObjTmp.count > diagramColumnsCount){
          diagramColumnsCount = countObjTmp.count;
        }
      }
    }else{
      if(!diagramList[i].orphan){
        diagramLinesCount.push({ id: diagramList[i].y, count:1 });
        diagramList[i].x = 1;
      }
    }
  }

  data.config.linesCount = diagramLinesCount;
  data.config.columnsCount = diagramColumnsCount;
  data.config.columnLower = diagramColumnLower;
  data.config.scaleFactor = 1.1;
  data.config.zoomScale = 0;
  data.config.moveX = 0;
  data.config.moveY = 0;

  this.helper = helper;
  this.config = data.config;
  this.diagrams = diagramList;
  this.draw();
  this.events();

}

AntuaneChart.prototype.zoom = function(zoomSize){
  var _canvas = this.canvas;
  var _context = this.context;
  var _config = this.config;
  _config.zoomScale += zoomSize;
  var pt = _context.transformedPoint(_canvas.width / 2,_canvas.height / 2);
  this.context.translate(pt.x,pt.y);
  var factor = Math.pow(_config.scaleFactor,zoomSize);
  _context.scale(factor,factor);
  _context.translate(-pt.x,-pt.y);
  this.draw();
}



AntuaneChart.prototype.rezetZoom = function(){
  var _config = this.config;
    this.zoom(-_config.zoomScale);
    _context.translate(-_config.moveX,-_config.moveY);
    _config.zoomScale = 0;
    _config.moveX = 0;
    _config.moveY = 0;
}

AntuaneChart.prototype.events = function(){

  var _this = this;
  var _canvas = this.canvas;
  var _context = this.context;
  var _config = this.config;
  // var _diagrams = this.diagrams;
  // var _helper = this.helper;
  //
  var lastX=_canvas.width/2;
  var lastY=_canvas.height/2;
  var dragStart = false;
  var dragged = false;
  //
  _canvas.addEventListener('mousedown',function(evt){
      document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
      _canvas.style.cursor = "move";
      lastX = evt.offsetX || (evt.pageX - _canvas.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - _canvas.offsetTop);
      dragStart = _context.transformedPoint(lastX,lastY);
      dragged = false;
      evt.returnValue = false;
  },false);

  _canvas.addEventListener('mousemove',function(evt){
      lastX = evt.offsetX || (evt.pageX - _canvas.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - _canvas.offsetTop);

      dragged = true;
      if (dragStart){
          var pt = _context.transformedPoint(lastX,lastY);
          _context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
          _this.draw();
          _config.moveX += pt.x-dragStart.x;
          _config.moveY += pt.y-dragStart.y;
      }
  },false);

  _canvas.addEventListener('mouseup',function(evt){
      dragStart = null;
      _canvas.style.cursor = "default";
      //if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
  },false);


  var handleScroll = function(evt){
      var delta = evt.wheelDelta ? evt.wheelDelta/300 : evt.detail ? -evt.detail : 0;
      _this.zoom(delta);
      return evt.preventDefault() && false;
  };

  _canvas.addEventListener('DOMMouseScroll',handleScroll,false);
  _canvas.addEventListener('mousewheel',handleScroll,false);
}

AntuaneChart.prototype.draw = function(){
  var _canvas = this.canvas;
  var _context = this.context;
  var _config = this.config;
  var _diagrams = this.diagrams;
  var _helper = this.helper;
  var p1 = _context.transformedPoint(0,0);
  var p2 = _context.transformedPoint(_canvas.width,_canvas.height);
  _context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

  var diagramWithMargin = _config.width + (2 * _config.margin);

  if(_config.columnsCount == 0){
    _config.columnsCount = parseInt(_canvas.width / diagramWithMargin);
  }

  var maxWidth = _config.columnsCount * diagramWithMargin;
  var marginScreen = (parseInt(_canvas.width) / 2 ) - (maxWidth / 2);

  _context.rotate(2 * Math.PI);

  var countOrphanDemand = 0;
  for(var i = 0; i < _diagrams.length; i++){
    if(_diagrams[i].orphan){
      var positionX = marginScreen + _config.margin + parseInt(countOrphanDemand % (_config.columnsCount)) * (_config.width + (2 * _config.margin));
      var positionY = _config.margin + parseInt(countOrphanDemand / (_config.columnsCount)) * (_config.height + (2 * _config.margin));
      var diagramDrawArea = _context;
      diagramDrawArea.fillStyle= _diagrams[i].bgColor;
      diagramDrawArea.fillRect(positionX,positionY, _config.width, _config.height);
      //
      var nodeText = _context;
      nodeText.fillStyle= _diagrams[i].color;
      nodeText.font= _config.fontSize + "px " + _config.fontFamily;
      _helper.wrapText(_context, _diagrams[i].text, positionX + _config.padding, positionY + _config.padding + _config.fontSize, _config.width - (2 * _config.padding) , (_config.fontSize + (_config.fontSize * 0.2)));

      countOrphanDemand++;
    }
  }

  //CALCULATE X Y NOT ORPHANS DIAGRAMS

  var marginTopNotOrphans = (_config.height + (3 * _config.margin)) + parseInt((countOrphanDemand-1) / _config.columnsCount) * (_config.height + (2 * _config.margin));

  if(isNaN(marginTopNotOrphans)){
    marginTopNotOrphans = _config.margin;
  }

  for(var i = 0; i < _diagrams.length; i++){
    if(!_diagrams[i].orphan){
      var maxColumnsInLine = _helper.getObjById(_config.linesCount, _diagrams[i].y).count;
      var ratio = maxWidth / maxColumnsInLine;
      var positionX = marginScreen + (ratio * _diagrams[i].x) + (ratio / 2 - (_config.width /2)) - ratio;
      var positionY = marginTopNotOrphans + (Math.abs(_config.columnLower) * (_config.height + (2 * _config.margin))) + _diagrams[i].y * (_config.height + (2 * _config.margin));
      _diagrams[i].left = positionX;
      _diagrams[i].top = positionY;
    }
  }

  //DRAW LINES

  for(var i = 0; i < _diagrams.length; i++){
    if(!_diagrams[i].orphan){



      for(var j = 0; j < _diagrams[i].parents.length; j++){
        var tmpObj = _helper.getObjById(_diagrams, _diagrams[i].parents[j]);
        var invertParent = false;
        var neighbor = false;
        var neighborRight = false;
        var neighborLeft = false;
        var isDistant = false;
        var autoRef = false;
        var countDistant = 0;
        var countInvertParent = 0;

        if(_diagrams[i].id == tmpObj.id){
          autoRef = true;
        }
        else if(_diagrams[i].y == tmpObj.y){
          if(_diagrams[i].x - tmpObj.x == -1){
            neighborRight = true;
          }else if(_diagrams[i].x - tmpObj.x == 1){
            neighborLeft = true;
          }else{
            neighbor = true;
          }
        }else if (_diagrams[i].y < tmpObj.y){
          invertParent = true;
        }else if((_diagrams[i].y - tmpObj.y) > 1){
          isDistant = true;
        }

        if(autoRef){
          var difference = ((_config.margin/2)-((_config.margin / _config.columnsCount) * _diagrams[i].x));

          if(!isFinite(difference)){
            difference = 0;
          }

          var line = _context;
          _context.setLineDash([0]);

          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;
          line.moveTo((tmpObj.left + (_config.width /2)) + (difference * -1) + difference, tmpObj.top + _config.height);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1) + difference, tmpObj.top + _config.height + (_config.margin/2));
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1) - difference, tmpObj.top + _config.height + (_config.margin/2));
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1) - difference, tmpObj.top + _config.height + (_config.arrowWidth/2));
          line.lineWidth = _config.lineWidth;
          line.stroke();


          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo((tmpObj.left + (_config.width /2)) + (difference * -1)- difference, tmpObj.top + _config.height);
          arrow.lineTo((tmpObj.left + (_config.width /2)) - (_config.arrowWidth/2) + (difference * -1)- difference, tmpObj.top + _config.height + _config.arrowWidth);
          arrow.lineTo((tmpObj.left + (_config.width /2)) + (_config.arrowWidth/2) + (difference * -1)- difference, tmpObj.top + _config.height + _config.arrowWidth);
          arrow.fill();

        }
        else if(neighborRight){
          var line = _context;
          _context.setLineDash([0]);
          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;
          line.moveTo(_diagrams[i].left + (_config.width /2), _diagrams[i].top + (_config.height / 2));
          line.lineTo(tmpObj.left - _config.arrowWidth , tmpObj.top + (_config.height / 2));
          line.lineWidth = _config.lineWidth;
          line.stroke();

          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo(tmpObj.left, tmpObj.top + (_config.height / 2));
          arrow.lineTo(tmpObj.left - _config.arrowWidth, tmpObj.top + (_config.height / 2) - (_config.arrowWidth / 2));
          arrow.lineTo(tmpObj.left - _config.arrowWidth, tmpObj.top + (_config.height / 2) + (_config.arrowWidth / 2));
          arrow.fill();

        }else if(neighborLeft){

          var line = _context;
          _context.setLineDash([0]);
          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;
          line.moveTo(_diagrams[i].left + (_config.width /2), _diagrams[i].top + (_config.height / 2));
          line.lineTo(tmpObj.left + _config.width + _config.arrowWidth, tmpObj.top + (_config.height / 2));
          line.lineWidth = _config.lineWidth;
          line.stroke();

          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo(tmpObj.left + _config.width , tmpObj.top + (_config.height / 2));
          arrow.lineTo(tmpObj.left + _config.width + _config.arrowWidth, tmpObj.top + (_config.height / 2) - (_config.arrowWidth / 2));
          arrow.lineTo(tmpObj.left + _config.width + _config.arrowWidth, tmpObj.top + (_config.height / 2) + (_config.arrowWidth / 2));
          arrow.fill();

        }else if(neighbor){
          //var
          var difference = ((_config.margin/2)-((_config.margin / _config.columnsCount) * _diagrams[i].x));

          if(!isFinite(difference)){
            difference = 0;
          }

          var line = _context;
          _context.setLineDash([0]);
          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;;
          line.moveTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top);
          line.lineTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.margin - _config.arrowWidth);
          line.lineWidth = _config.lineWidth;
          line.stroke();


          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo((tmpObj.left + (_config.width /2)) - difference, tmpObj.top);
          arrow.lineTo((tmpObj.left + (_config.width /2)) - (_config.arrowWidth/2) - difference, tmpObj.top - _config.arrowWidth);
          arrow.lineTo((tmpObj.left + (_config.width /2)) + (_config.arrowWidth/2) - difference, tmpObj.top - _config.arrowWidth);
          arrow.fill();

        }else if(invertParent){
          var difference = ((_config.margin/2)-((_config.margin / _config.columnsCount) * _diagrams[i].x)) + (_config.margin  - (_config.arrowWidth + (_config.lineWidth * 2 * countInvertParent)));
          var line = _context;
          _context.setLineDash([_config.lineWidth * 2]);
          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;
          line.moveTo((_diagrams[i].left + (_config.width /2)) + difference, _diagrams[i].top + (_config.height /2) + difference);
          line.lineTo(_diagrams[i].left + _config.width + _config.margin + difference, _diagrams[i].top + (_config.height /2) + difference);
          line.lineTo(_diagrams[i].left + _config.width + _config.margin + difference, tmpObj.top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + difference, tmpObj.top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + difference, tmpObj.top - _config.arrowWidth + difference);
          line.lineWidth = _config.lineWidth;
          line.stroke();

          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo((tmpObj.left + (_config.width /2)) + difference, tmpObj.top);
          arrow.lineTo((tmpObj.left + (_config.width /2)) - (_config.arrowWidth/2) + difference, tmpObj.top - _config.arrowWidth);
          arrow.lineTo((tmpObj.left + (_config.width /2)) + (_config.arrowWidth/2) + difference, tmpObj.top - _config.arrowWidth);
          arrow.fill();

        }else if(isDistant){

          var difference = ((_config.margin/2)-((_config.margin / _config.columnsCount) * _diagrams[i].x)) + (_config.margin  - (_config.arrowWidth + (_config.lineWidth * 2 * countDistant)));
          countDistant++;

          if(!isFinite(difference)){
            difference = 0;
          }

          var line = _context;
          _context.setLineDash([_config.lineWidth * 2]);

          line.beginPath();
          line.strokeStyle = _config.lineColor || _helper.colorLuminance(_diagrams[i].bgColor, -0.2);

          line.moveTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top);
          line.lineTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), _diagrams[i].top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height + _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height + (_config.arrowWidth/2));
          line.lineWidth = _config.lineWidth;
          line.stroke();


          var arrow = _context;
          arrow.fillStyle = _config.lineColor || _helper.colorLuminance(_diagrams[i].bgColor, -0.2);
          arrow.beginPath();
          arrow.moveTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height);
          arrow.lineTo((tmpObj.left + (_config.width /2)) - (_config.arrowWidth/2) + (difference * -1), tmpObj.top + _config.height + _config.arrowWidth);
          arrow.lineTo((tmpObj.left + (_config.width /2)) + (_config.arrowWidth/2) + (difference * -1), tmpObj.top + _config.height + _config.arrowWidth);
          arrow.fill();



        }else{
          //var
          var difference = ((_config.margin/2)-((_config.margin / _config.columnsCount) * _diagrams[i].x));

          if(!isFinite(difference)){
            difference = 0;
          }

          var line = _context;
          _context.setLineDash([0]);

          line.beginPath();
          line.strokeStyle = _config.lineColor || _diagrams[i].bgColor;
          line.moveTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top);
          line.lineTo((_diagrams[i].left + (_config.width /2)) + (difference * -1), _diagrams[i].top - _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height + _config.margin + difference);
          line.lineTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height + (_config.arrowWidth/2));
          line.lineWidth = _config.lineWidth;
          line.stroke();


          var arrow = _context;
          arrow.fillStyle= _config.lineColor || _diagrams[i].bgColor;
          arrow.beginPath();
          arrow.moveTo((tmpObj.left + (_config.width /2)) + (difference * -1), tmpObj.top + _config.height);
          arrow.lineTo((tmpObj.left + (_config.width /2)) - (_config.arrowWidth/2) + (difference * -1), tmpObj.top + _config.height + _config.arrowWidth);
          arrow.lineTo((tmpObj.left + (_config.width /2)) + (_config.arrowWidth/2) + (difference * -1), tmpObj.top + _config.height + _config.arrowWidth);
          arrow.fill();
        }
      }
    }
  }

  //DRAW NOT ORPHANS DIAGRAMS

  for(var i = 0; i < _diagrams.length; i++){
    if(!_diagrams[i].orphan){
      var positionX = _diagrams[i].left;
      var positionY = _diagrams[i].top;
      var diagramDrawArea = _context;
      diagramDrawArea.fillStyle= _diagrams[i].bgColor;
      diagramDrawArea.fillRect(positionX,positionY, _config.width, _config.height);

      var nodeText = _context;
      nodeText.fillStyle= _diagrams[i].color;
      nodeText.font= _config.fontSize + "px " + _config.fontFamily;
      _helper.wrapText(_context, _diagrams[i].text, positionX + _config.padding, positionY + _config.padding + _config.fontSize, _config.width - (2 * _config.padding) , (_config.fontSize + (_config.fontSize * 0.2)));
    }
  }

}
