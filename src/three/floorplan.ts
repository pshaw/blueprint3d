/// <reference path="../../lib/three.d.ts" />
/// <reference path="floor.ts" />
/// <reference path="edge.ts" />

module BP3D.Three {

    export var cbb;
    

    export var Floorplan = function (scene: BP3D.Model.Scene, floorplan: BP3D.Model.Floorplan, controls) {
    console.log("BP3D.Three.Floorplan:");
    console.log(scene);
    console.log(floorplan);
    console.log(controls);

    var scope = this;

    this.scene = scene;
    this.floorplan = floorplan;
    this.controls = controls;

    this.floors = [];
    this.edges = [];

    floorplan.fireOnUpdatedRooms(redraw);

    function redraw() {
        console.log("start redraw");
      // clear scene
        scope.floors.forEach((floor) => {
            console.log("clear floor");	
        floor.removeFromScene();
      });

        scope.edges.forEach((edge) =>
        {
            console.log("clear edge");
        edge.remove();
      });
      scope.floors = [];
      scope.edges = [];

      var nm_meshes = [];

      // draw floors
      scope.floorplan.getRooms().forEach((room) => {
        var threeFloor = new Three.Floor(scene, room);
        scope.floors.push(threeFloor);
        nm_meshes.push(threeFloor.addToScene());
      });

      // draw edges
      scope.floorplan.wallEdges().forEach((edge) => {
        var threeEdge = new Three.Edge(scene, edge, scope.controls);
        scope.edges.push(threeEdge);
        console.log(threeEdge);
        var tMeshes = threeEdge.getMeshes();
        console.log(tMeshes);
        nm_meshes.push(tMeshes); 
        
      });

      console.log("end redraw(), created meshes:");
      console.log(nm_meshes);	

      return nm_meshes;
     
    }

    BP3D.Three.cbb = redraw;

    }
}
