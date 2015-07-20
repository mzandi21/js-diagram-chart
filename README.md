# AntuaneChart

  It is a simple diagram chart based on hierarchy
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
               {id: 1, text: "Text Example", color: "#ffffff", bgColor: "#330000"},
               {id: 2, text: "Text Example", color: "#ffffff", bgColor: "#003300"},
               {id: 3, text: "Text Example", color: "#ffffff", bgColor: "#000033"},
               {id: 4, text: "Text Example", color: "#ffffff", bgColor: "#333300"},
               {id: 5, text: "Text Example", color: "#ffffff", bgColor: "#003333"},
               {id: 6, text: "Text Example", color: "#ffffff", bgColor: "#330033"}
             ],
             links: [
               { source: 2, parent:1  },
               { source: 3, parent:1  },
               { source: 4, parent:3  },
               { source: 5, parent:3  },
               { source: 6, parent:2  }
             ],
             config:{
               element: "mycanvas",
               margin: 49,
               padding: 10,
               width: 250,
               height: 170,
               arrowWidth: 10,
               lineWidth: 2,
               fontFamily: "Arial",
               fontSize: 12,
               linkColor: "#ff0000",
               autoSize : true,
             }
           };


           var antuaneChart = new AntuaneChart(dataExample);

        ```

## Live Example JSFiddle

  http://jsfiddle.net/antuane/7qp15m3v/
