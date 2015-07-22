# AntuaneChart

  It is a simple diagram chart based on hierarchy.
  Javascript / Html5 / Canvas

## How to use

  1. Import antuane-chart.js in your html page.
  2. Create element canvas with an id.

    Example:

      ```bash
       <canvas id="mycanvas" width="640" height="480"></canvas>
      ```

  3. Call AntuaneChart function after canvas element

      Example:

        ```
        var dataExample = {
          diagrams: [
            {id: 1, text: "DIAGRAM 01", color: "#ffffff", bgColor: "#330000"},
            {id: 2, text: "DIAGRAM 02", color: "#ffffff", bgColor: "#003300"},
            {id: 3, text: "DIAGRAM 03", color: "#ffffff", bgColor: "#000033"},
            {id: 4, text: "DIAGRAM 04", color: "#ffffff", bgColor: "#333300"},
            {id: 5, text: "DIAGRAM 05", color: "#ffffff", bgColor: "#003333"},
            {id: 6, text: "DIAGRAM 06", color: "#ffffff", bgColor: "#330033"},
            {id: 7, text: "DIAGRAM 07", color: "#ffffff", bgColor: "#000000"},
            {id: 8, text: "DIAGRAM 08", color: "#ffffff", bgColor: "#000000"},
            {id: 9, text: "DIAGRAM 09", color: "#ffffff", bgColor: "#000000"},
            {id: 10, text: "DIAGRAM 10", color: "#ff0000", bgColor: "#333333"}
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
            lineWidth: 3,
            //lineColor: "#FF0000",
            fontFamily: "Arial",
            fontSize: 12,
            autoSize : true,
          }
        };

        var graphDidio = new AntuaneChart(dataExample);
        ```

### Live Example JSFiddle

  http://jsfiddle.net/antuane/7qp15m3v/




  _
