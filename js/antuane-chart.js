'use strict';

function AntuaneChart(data) {
  this.init(data);
  console.log(data);
}

AntuaneChart.prototype.init = function(data){
  //try{
    this.elements = data.elements;
    this.links = data.links;
    this.config = data.config;

    this.canvas = document.getElementById(data.config.element);

    if(this.canvas){
      this.context = this.canvas.getContext("2d");
    }else{
      throw "Element not found"
    }

    this.context = this.canvas.getContext("2d");

    if(data.config.autoSize){
        this.canvas.width = this.canvas.parentNode.clientWidth;
        this.canvas.height = this.canvas.parentNode.clientHeight;
    }

  // }
  // catch(error){
  //   console.log("Error: " + error);
  //
  // }


}

AntuaneChart.prototype.update = function(){
}

AntuaneChart.prototype.draw = function(){
}

AntuaneHelper = function(){

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
}
