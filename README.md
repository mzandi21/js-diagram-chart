# AntuaneChart

  It is a simple diagram chart based on hierarchy, developed in Javascript!

  ![Example](https://github.com/antuane/chart/raw/master/example.png)

## How to use

  1. Import antuane-chart.js in your html page.
  2. Create element canvas with an id.

  Example:

    ```bash
    <canvas id="mycanvas" width="640" height="480">
      Canvas not supported! :(
    </canvas>
    ```

  3. Call AntuaneChart function after canvas element and use JSON to data

  Example:

    ```bash
    <script type="text/javascript">
      var dataExample = {
        diagrams: [
        {id: 1, text: "DIAGRAM 01", color: "#999999", bgColor: "#330000"},
        {id: 2, text: "DIAGRAM 02", color: "#999999", bgColor: "#003300"},
        {id: 3, text: "DIAGRAM 03", color: "#999999", bgColor: "#000033"},
        {id: 4, text: "DIAGRAM 04", color: "#999999", bgColor: "#333300"},
        {id: 5, text: "DIAGRAM 05", color: "#999999", bgColor: "#003333"},
        {id: 6, text: "DIAGRAM 06", color: "#999999", bgColor: "#330033"},
        {id: 7, text: "DIAGRAM 07", color: "#999999", bgColor: "#000000"},
        {id: 8, text: "DIAGRAM 08", color: "#999999", bgColor: "#000000"},
        {id: 9, text: "DIAGRAM 09", color: "#999999", bgColor: "#000000"},
        {id: 10, text: "DIAGRAM 10", color: "#999999", bgColor: "#333333"}
        ],
        links: [
        { source: 2, parent:1  },
        { source: 3, parent:1  },
        { source: 4, parent:3  },
        { source: 5, parent:3  },
        { source: 6, parent:2  },
        { source: 9, parent:9  },
        { source: 9, parent:6  }
        ],
        config:{
          element: "mycanvas",
          margin: 30,
          padding: 10,
          width: 100,
          height: 50,
          radius: 3,
          hiddenBg: false,
          arrowWidth: 8,
          lineWidth: 2,
          lineDiff: true,
          //lineColor: "#000000", // OPTIONAL
          //hiddenBg: true, // OPTIONAL
          fontFamily: "Arial",
          fontSize: 12,
          autoSize : true,
          mouseEvents:true
        }
      };

      var chart = new AntuaneChart(dataExample);

      //OTHERS METHODS 

      //chart.addZoom(-5);
      //chart.resetZoom();
      //chart.update(dataExample);

    </script>
    ```

### Live Example

[Click here](http://jsfiddle.net/antuane/7qp15m3v) to live example by JSFiddle.


### Problems & Bugs?

 Make sure that you have a *functional* [jsfiddle](http://jsfiddle.net/) exemplifying your problem and open an [issue](https://github.com/antuane/antuane-chart/issues) for us. Don't know how to do it? Use this [fiddle example](http://jsfiddle.net/antuane/7qp15m3v).

## Thanks!
* [S2IT Solutions]( http://www.s2it.com.br )





_
