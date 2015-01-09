/*!
 * didioChart.js
 * http://antuane.com.br/
 * Version: 1.0.0
 *
 * Copyright 2015 Diógenes Silveira
 * Released under the MIT license
 * https://github.com/antuane/
 */

var didioChart = function(data, config){

    //GLOBAL VARIABLES
    var CANVAS = document.getElementsByTagName('canvas')[0];
    var CONTEXT = CANVAS.getContext("2d");
    var FULL_SCREEN = false;
    var DIAGRAM_WIDTH = 300;
    var DIAGRAM_HEIGHT = 170;
    var DIAGRAM_MARGIN = 50;
    var DIAGRAM_PADDING = 10;
    var ARROW_WIDTH = 8;
    var LINE_WIDTH = 1.2;
    var FONT_FAMILY = "Arial";
    var FONT_SIZE = 12;
    var ZOOM_SCALE = 0;
    var MOVE_X = 0;
    var MOVE_Y = 0;

    if(config.hasOwnProperty('arrowWidth')){
        ARROW_WIDTH = config.arrowWidth;
    }

    if(config.hasOwnProperty('lineWidth')){
        LINE_WIDTH = config.lineWidth;
    }

    if(config.hasOwnProperty('fontFamily')){
        FONT_FAMILY = config.fontFamily;
    }

    if(config.hasOwnProperty('fontSize')){
        FONT_SIZE = config.fontSize;
    }

    if(config.hasOwnProperty('width')){
        DIAGRAM_WIDTH = config.width;
    }

    if(config.hasOwnProperty('height')){
        DIAGRAM_HEIGHT = config.height;
    }

    if(config.hasOwnProperty('margin')){
        DIAGRAM_MARGIN = config.margin;
    }

    if(config.hasOwnProperty('padding')){
        DIAGRAM_PADDING = config.padding;
    }

    if(config.hasOwnProperty('fullScreen')){
        FULL_SCREEN = config.fullScreen;
    }

    if(FULL_SCREEN){
        CANVAS.width = document.body.clientWidth;
        CANVAS.height = document.body.clientHeight;
    }

    var LIST_OBJECTS = [];
    var LIST_COUNT_LINES_OBJECTS = [];
    var LIST_MAX_COLUMNS = 0;
    var LIST_LOWER_COLUMN = 0;
    CONTEXT.lineCap = 'round';

    // UTILS FUNCTIONS

    var getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }


    function wrapText(context, text, x, y, maxWidth, lineHeight) {
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

    var colorLuminance = function(hex, lum) {
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

    var cloneObj = function(obj) {
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

    var getObjById = function(listObj, idObj){
        for(var i = 0; i < listObj.length; i++){
            if(listObj[i].id ==  idObj){
                return listObj[i];
            }
        }
        return null;
    }

    //POPULATE LIST OBJECT

    for(var i = 0; i < data.nodes.length; i++){

        var objectDiagram = {
            id: data.nodes[i].id,
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
            text: data.nodes[i].text,
            color: data.nodes[i].color,
            bgColor: data.nodes[i].bgColor,
            parents: [],
            children: [],
            virgin: true,
            orphan: true,
        }

        for(var j = 0; j < data.edges.length; j++){

            if(data.edges[j].source == objectDiagram.id){
                objectDiagram.parents.push(data.edges[j].parent);
                objectDiagram.orphan = false;
            }

            if(data.edges[j].parent == objectDiagram.id){
                objectDiagram.children.push(data.edges[j].source);
                objectDiagram.orphan = false;
            }

        }

        LIST_OBJECTS.push(objectDiagram);

    }

    //GET OBJECT LINES

    var getLinesObjects = function(object, hierarchy){
        if(object.virgin){
            object.virgin = false;
            object.y = hierarchy;

            if(hierarchy < LIST_LOWER_COLUMN){
                LIST_LOWER_COLUMN = hierarchy;
            }

            for(var i = 0; i < object.children.length; i++){
                var tmpObj = getObjById(LIST_OBJECTS, object.children[i]);
                getLinesObjects(tmpObj, hierarchy + 1);
            }

            for(var i = 0; i < object.parents.length; i++){
                var tmpObj = getObjById(LIST_OBJECTS, object.parents[i]);
                getLinesObjects(tmpObj, hierarchy - 1);
            }
        }
    }

    for(var i = 0; i < LIST_OBJECTS.length; i++){
        getLinesObjects(LIST_OBJECTS[i], 0);
    }

    //GET OBJECTS COLUMNS

    for(var i = 0; i < LIST_OBJECTS.length; i++){
        var countObjTmp = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y);
        if(countObjTmp != null){
            if(!LIST_OBJECTS[i].orphan){
                countObjTmp.count++;
                LIST_OBJECTS[i].x = countObjTmp.count;
                if(countObjTmp.count > LIST_MAX_COLUMNS){
                    LIST_MAX_COLUMNS = countObjTmp.count;
                }
            }
        }else{
            if(!LIST_OBJECTS[i].orphan){
                LIST_COUNT_LINES_OBJECTS.push({ id: LIST_OBJECTS[i].y, count:1 });
                LIST_OBJECTS[i].x = 1;
            }
        }
    }

    //DRAW FUNCTIONS

    var draw = function(){

        var p1 = CONTEXT.transformedPoint(0,0);
        var p2 = CONTEXT.transformedPoint(CANVAS.width,CANVAS.height);
        CONTEXT.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

        // DRAW OBJECTS

        if(LIST_MAX_COLUMNS == 0){
            LIST_MAX_COLUMNS = parseInt(CANVAS.width / (DIAGRAM_WIDTH + (2 * DIAGRAM_MARGIN)));
        }


        var maxWidth = LIST_MAX_COLUMNS * (DIAGRAM_WIDTH + (2 * DIAGRAM_MARGIN));
        var marginScreen = (parseInt(CANVAS.width) / 2 ) - (maxWidth / 2);


        //DRAW ORPHANS DIAGRAMS
        var diagramDrawArea = CONTEXT;
        //diagramDrawArea.rotate(0.2 * Math.PI);
        //diagramDrawArea.fillStyle= "#000000";
        //CONTEXT.fillRect(0,0, maxWidth, maxWidth);

        diagramDrawArea.rotate(2 * Math.PI);

        var countOrphanDemand = 0;
        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(LIST_OBJECTS[i].orphan){
                var positionX = marginScreen + DIAGRAM_MARGIN + parseInt(countOrphanDemand % (LIST_MAX_COLUMNS)) * (DIAGRAM_WIDTH + (2 * DIAGRAM_MARGIN));
                var positionY = DIAGRAM_MARGIN + parseInt(countOrphanDemand / (LIST_MAX_COLUMNS)) * (DIAGRAM_HEIGHT + (2 * DIAGRAM_MARGIN));
                var diagramDrawArea = CONTEXT;
                diagramDrawArea.fillStyle= LIST_OBJECTS[i].bgColor;
                diagramDrawArea.fillRect(positionX,positionY, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);
                //
                var nodeText = CONTEXT;
                nodeText.fillStyle= LIST_OBJECTS[i].color;
                nodeText.font= FONT_SIZE + "px " + FONT_FAMILY;
                for(var j = 0; j < LIST_OBJECTS[i].text.length; j++){
                    nodeText.fillText(LIST_OBJECTS[i].text[j], positionX + DIAGRAM_PADDING, positionY + DIAGRAM_PADDING + ((FONT_SIZE + (FONT_SIZE * 0.2)) * (j + 1)));
                }
                countOrphanDemand++;
            }
        }

        //CALCULATE X Y NOT ORPHANS DIAGRAMS

        var marginTopNotOrphans = (DIAGRAM_HEIGHT + (3 * DIAGRAM_MARGIN)) + parseInt((countOrphanDemand-1) / LIST_MAX_COLUMNS) * (DIAGRAM_HEIGHT + (2 * DIAGRAM_MARGIN));

        if(isNaN(marginTopNotOrphans)){
            marginTopNotOrphans = DIAGRAM_MARGIN;
        }

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].orphan){
                var maxColumnsInLine = getObjById(LIST_COUNT_LINES_OBJECTS, LIST_OBJECTS[i].y).count;
                var ratio = maxWidth / maxColumnsInLine;
                var positionX = marginScreen + (ratio * LIST_OBJECTS[i].x) + (ratio / 2 - (DIAGRAM_WIDTH /2)) - ratio;
                var positionY = marginTopNotOrphans + (Math.abs(LIST_LOWER_COLUMN) * (DIAGRAM_HEIGHT + (2 * DIAGRAM_MARGIN))) + LIST_OBJECTS[i].y * (DIAGRAM_HEIGHT + (2 * DIAGRAM_MARGIN));
                LIST_OBJECTS[i].left = positionX;
                LIST_OBJECTS[i].top = positionY;
            }
        }

        //DRAW LINES

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].orphan){



                for(var j = 0; j < LIST_OBJECTS[i].parents.length; j++){
                    var tmpObj = getObjById(LIST_OBJECTS, LIST_OBJECTS[i].parents[j]);
                    var invertParent = false;
                    var neighbor = false;
                    var neighborRight = false;
                    var neighborLeft = false;
                    var isDistant = false;
                    var countDistant = 0;
                    var countInvertParent = 0;

                    if(LIST_OBJECTS[i].y == tmpObj.y){
                        if(LIST_OBJECTS[i].x - tmpObj.x == -1){
                            neighborRight = true;
                        }else if(LIST_OBJECTS[i].x - tmpObj.x == 1){
                            neighborLeft = true;
                        }else{
                            neighbor = true;
                        }
                    }else if (LIST_OBJECTS[i].y < tmpObj.y){
                        invertParent = true;
                    }else if((LIST_OBJECTS[i].y - tmpObj.y) > 1){
                        isDistant = true;
                    }


                    if(neighborRight){
                        var line = CONTEXT;
                        CONTEXT.setLineDash([0]);
                        line.beginPath();
                        line.strokeStyle = LIST_OBJECTS[i].bgColor;
                        line.moveTo(LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2), LIST_OBJECTS[i].top + (DIAGRAM_HEIGHT / 2));
                        line.lineTo(tmpObj.left - ARROW_WIDTH , tmpObj.top + (DIAGRAM_HEIGHT / 2));
                        line.lineWidth = LINE_WIDTH;
                        line.stroke();
                        var arrow = CONTEXT;
                        arrow.fillStyle= LIST_OBJECTS[i].bgColor;
                        arrow.beginPath();
                        arrow.moveTo(tmpObj.left, tmpObj.top + (DIAGRAM_HEIGHT / 2));
                        arrow.lineTo(tmpObj.left - ARROW_WIDTH, tmpObj.top + (DIAGRAM_HEIGHT / 2) - (ARROW_WIDTH / 2));
                        arrow.lineTo(tmpObj.left - ARROW_WIDTH, tmpObj.top + (DIAGRAM_HEIGHT / 2) + (ARROW_WIDTH / 2));
                        arrow.fill();
                    }else if(neighborLeft){
                        var line = CONTEXT;
                        CONTEXT.setLineDash([0]);
                        line.beginPath();
                        line.strokeStyle = LIST_OBJECTS[i].bgColor;
                        line.moveTo(LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2), LIST_OBJECTS[i].top + (DIAGRAM_HEIGHT / 2));
                        line.lineTo(tmpObj.left + DIAGRAM_WIDTH + ARROW_WIDTH, tmpObj.top + (DIAGRAM_HEIGHT / 2));
                        line.lineWidth = LINE_WIDTH;
                        line.stroke();

                        var arrow = CONTEXT;
                        arrow.fillStyle= LIST_OBJECTS[i].bgColor;
                        arrow.beginPath();
                        arrow.moveTo(tmpObj.left + DIAGRAM_WIDTH , tmpObj.top + (DIAGRAM_HEIGHT / 2));
                        arrow.lineTo(tmpObj.left + DIAGRAM_WIDTH + ARROW_WIDTH, tmpObj.top + (DIAGRAM_HEIGHT / 2) - (ARROW_WIDTH / 2));
                        arrow.lineTo(tmpObj.left + DIAGRAM_WIDTH + ARROW_WIDTH, tmpObj.top + (DIAGRAM_HEIGHT / 2) + (ARROW_WIDTH / 2));
                        arrow.fill();

                    }else if(neighbor){
                        //var
                        var difference = ((DIAGRAM_MARGIN/2)-((DIAGRAM_MARGIN / LIST_MAX_COLUMNS) * LIST_OBJECTS[i].x));

                        if(!isFinite(difference)){
                            difference = 0;
                        }

                        var line = CONTEXT;
                        CONTEXT.setLineDash([0]);
                        line.beginPath();
                        line.strokeStyle = LIST_OBJECTS[i].bgColor;;
                        line.moveTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top);
                        line.lineTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_MARGIN - ARROW_WIDTH);
                        line.lineWidth = LINE_WIDTH;
                        line.stroke();


                        var arrow = CONTEXT;
                        arrow.fillStyle= LIST_OBJECTS[i].bgColor;
                        arrow.beginPath();
                        arrow.moveTo((tmpObj.left + (DIAGRAM_WIDTH /2)) - difference, tmpObj.top);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) - (ARROW_WIDTH/2) - difference, tmpObj.top - ARROW_WIDTH);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (ARROW_WIDTH/2) - difference, tmpObj.top - ARROW_WIDTH);
                        arrow.fill();

                    }else if(invertParent){
                        var difference = ((DIAGRAM_MARGIN/2)-((DIAGRAM_MARGIN / LIST_MAX_COLUMNS) * LIST_OBJECTS[i].x)) + (DIAGRAM_MARGIN  - (ARROW_WIDTH + (LINE_WIDTH * 2 * countInvertParent)));
                        var line = CONTEXT;
                        CONTEXT.setLineDash([LINE_WIDTH * 2]);
                        console.log(LIST_OBJECTS[i]);
                        line.beginPath();
                        line.strokeStyle = LIST_OBJECTS[i].bgColor;
                        line.moveTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + difference, LIST_OBJECTS[i].top + (DIAGRAM_HEIGHT /2) + difference);
                        line.lineTo(LIST_OBJECTS[i].left + DIAGRAM_WIDTH + DIAGRAM_MARGIN + difference, LIST_OBJECTS[i].top + (DIAGRAM_HEIGHT /2) + difference);
                        line.lineTo(LIST_OBJECTS[i].left + DIAGRAM_WIDTH + DIAGRAM_MARGIN + difference, tmpObj.top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + difference, tmpObj.top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + difference, tmpObj.top - ARROW_WIDTH + difference);
                        line.lineWidth = LINE_WIDTH;
                        line.stroke();

                        var arrow = CONTEXT;
                        arrow.fillStyle= LIST_OBJECTS[i].bgColor;
                        arrow.beginPath();
                        arrow.moveTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + difference, tmpObj.top);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) - (ARROW_WIDTH/2) + difference, tmpObj.top - ARROW_WIDTH);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (ARROW_WIDTH/2) + difference, tmpObj.top - ARROW_WIDTH);
                        arrow.fill();

                    }else if(isDistant){

                        var difference = ((DIAGRAM_MARGIN/2)-((DIAGRAM_MARGIN / LIST_MAX_COLUMNS) * LIST_OBJECTS[i].x)) + (DIAGRAM_MARGIN  - (ARROW_WIDTH + (LINE_WIDTH * 2 * countDistant)));
                        countDistant++;

                        if(!isFinite(difference)){
                            difference = 0;
                        }

                        var line = CONTEXT;
                        CONTEXT.setLineDash([LINE_WIDTH * 4]);

                        line.beginPath();
                        line.strokeStyle = colorLuminance(LIST_OBJECTS[i].bgColor, -0.2);

                        line.moveTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top);
                        line.lineTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT);
                        line.lineWidth = LINE_WIDTH * 2;
                        line.stroke();


                        var arrow = CONTEXT;
                        arrow.fillStyle = colorLuminance(LIST_OBJECTS[i].bgColor, -0.2);
                        arrow.beginPath();
                        arrow.moveTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) - (ARROW_WIDTH/2) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + ARROW_WIDTH);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (ARROW_WIDTH/2) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + ARROW_WIDTH);
                        arrow.fill();



                    }else{
                        //var
                        var difference = ((DIAGRAM_MARGIN/2)-((DIAGRAM_MARGIN / LIST_MAX_COLUMNS) * LIST_OBJECTS[i].x));

                        if(!isFinite(difference)){
                            difference = 0;
                        }

                        var line = CONTEXT;
                        CONTEXT.setLineDash([0]);

                        line.beginPath();
                        line.strokeStyle = LIST_OBJECTS[i].bgColor;
                        line.moveTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top);
                        line.lineTo((LIST_OBJECTS[i].left + (DIAGRAM_WIDTH /2)) + (difference * -1), LIST_OBJECTS[i].top - DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + DIAGRAM_MARGIN + difference);
                        line.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT);
                        line.lineWidth = LINE_WIDTH;
                        line.stroke();


                        var arrow = CONTEXT;
                        arrow.fillStyle= LIST_OBJECTS[i].bgColor;
                        arrow.beginPath();
                        arrow.moveTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) - (ARROW_WIDTH/2) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + ARROW_WIDTH);
                        arrow.lineTo((tmpObj.left + (DIAGRAM_WIDTH /2)) + (ARROW_WIDTH/2) + (difference * -1), tmpObj.top + DIAGRAM_HEIGHT + ARROW_WIDTH);
                        arrow.fill();
                    }
                }
            }
        }

        //DRAW NOT ORPHANS DIAGRAMS

        for(var i = 0; i < LIST_OBJECTS.length; i++){
            if(!LIST_OBJECTS[i].orphan){

                var positionX = LIST_OBJECTS[i].left;
                var positionY = LIST_OBJECTS[i].top;
                var diagramDrawArea = CONTEXT;
                diagramDrawArea.fillStyle= LIST_OBJECTS[i].bgColor;
                diagramDrawArea.fillRect(positionX,positionY, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);

                var nodeText = CONTEXT;
                nodeText.fillStyle= LIST_OBJECTS[i].color;
                nodeText.font= FONT_SIZE + "px " + FONT_FAMILY;
                for(var j = 0; j < LIST_OBJECTS[i].text.length; j++){
                    wrapText(CONTEXT, LIST_OBJECTS[i].text[j], positionX + DIAGRAM_PADDING, positionY + DIAGRAM_PADDING + ((FONT_SIZE + (FONT_SIZE * 0.2)) * (j + 1)), DIAGRAM_WIDTH - (2 * DIAGRAM_PADDING) , (FONT_SIZE + (FONT_SIZE * 0.2)));
                }
            }
        }
    }


    var lastX=CANVAS.width/2, lastY=CANVAS.height/2;
    var dragStart,dragged;

    CANVAS.addEventListener('mousedown',function(evt){
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        CANVAS.style.cursor = "move";
        lastX = evt.offsetX || (evt.pageX - CANVAS.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - CANVAS.offsetTop);
        dragStart = CONTEXT.transformedPoint(lastX,lastY);
        dragged = false;
        evt.returnValue = false;
    },false);

    CANVAS.addEventListener('mousemove',function(evt){
        lastX = evt.offsetX || (evt.pageX - CANVAS.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - CANVAS.offsetTop);

        dragged = true;
        if (dragStart){
            var pt = CONTEXT.transformedPoint(lastX,lastY);
            CONTEXT.translate(pt.x-dragStart.x,pt.y-dragStart.y);
            draw();
            MOVE_X += pt.x-dragStart.x;
            MOVE_Y += pt.y-dragStart.y;
        }
    },false);
    CANVAS.addEventListener('mouseup',function(evt){
        dragStart = null;
        CANVAS.style.cursor = "default";
        //if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
    },false);

    var scaleFactor = 1.1;
    var zoom = function(clicks){
        ZOOM_SCALE += clicks;
        var pt = CONTEXT.transformedPoint(CANVAS.width / 2,CANVAS.height / 2);
        CONTEXT.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,clicks);
        CONTEXT.scale(factor,factor);
        CONTEXT.translate(-pt.x,-pt.y);
        draw();
    }

    var changeZoom = function(clicks){
        ZOOM_SCALE += clicks;
        var pt = CONTEXT.transformedPoint(CANVAS.width / 2,CANVAS.height / 2);
        CONTEXT.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,clicks);
        CONTEXT.scale(factor,factor);
        CONTEXT.translate(-pt.x,-pt.y);
        draw();
    }

    //this.changeZoom = changeZoom;

    var resetZoom = function(){
        this.changeZoom(-ZOOM_SCALE);
        CONTEXT.translate(-MOVE_X,-MOVE_Y);
        ZOOM_SCALE = 0;
        MOVE_X = 0;
        MOVE_Y = 0;
    }

    //this.resetZoom = resetZoom;



    var handleScroll = function(evt){
        var delta = evt.wheelDelta ? evt.wheelDelta/300 : evt.detail ? -evt.detail : 0;
        zoom(delta);
        return evt.preventDefault() && false;
    };

    CANVAS.addEventListener('DOMMouseScroll',handleScroll,false);

    CANVAS.addEventListener('mousewheel',handleScroll,false);

    function trackTransforms(ctx){
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



    trackTransforms(CONTEXT);
    draw();


    return this

}
