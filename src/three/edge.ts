/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />

module BP3D.Three {

  // if using an already existing scenegraph, this creates 
  // an THREE.Object3D for every wall and (if Prefixlevel==true) yet another level
  // CreateHierarchy == false uses standard behaviour, i.e. all meshes end up at root level in the scene
  // TODO make whole blueprint3d Hierarchy- aware
  export class HierarchyConfig {
    static CreateHierarchy: boolean = false;  //create at least 1 intermediate level for each wall, named wall_1_wl for the first one
    static Prefix: string = "wall_";
    static Postfix: string = "_wl";
    static PrefixLevel: boolean = true;       //create a second intermediate level (named without postfix) i.e.  scene -> wall_1_wl -> wall_1 -> meshes
    static FirstFreeNumber: number = 1;
    }

  export var Edge = function (scene: BP3D.Model.Scene, edge: BP3D.Model.HalfEdge, controls) {
     
    var scope = this;
    var scene: BP3D.Model.Scene = scene;
    var edge = edge;
    var controls = controls;
    var wall = edge.wall;
    var front = edge.front;

    var planes = [];
    var basePlanes = []; // always visible
    var texture = null;

    var id = null; //for hierarchy

    var lightMap = THREE.ImageUtils.loadTexture("../../shared/rooms/textures/walllightmap.png");
    var fillerColor = 0xdddddd;
    var sideColor = 0xcccccc;
    var baseColor = 0xdddddd;

    this.visible = false;
    this.meshes = [];
    this.remove = function () {
      edge.redrawCallbacks.remove(redraw);
      controls.cameraMovedCallbacks.remove(updateVisibility);
      removeFromScene();
    }

    this.getMeshes = function(){
          return scope.meshes;
      }

    function init() {
      edge.redrawCallbacks.add(redraw);
      controls.cameraMovedCallbacks.add(updateVisibility);
      updateTexture();
      updatePlanes();
      var nm_planes = addToScene();
      console.log("init() returns:");
      console.log(nm_planes);
      return nm_planes;	
    }

    function redraw() {
      removeFromScene();
      updateTexture();
      updatePlanes();
      addToScene();
    }

    function removeFromScene() {
      if (HierarchyConfig.CreateHierarchy) {
        var selectedObject = scene.getScene().getObjectByName(scope.id);
        scene.getScene().remove(selectedObject);
      } else {
        planes.forEach((plane) => {
          scene.remove(plane);
        });
        basePlanes.forEach((plane) => {
          scene.remove(plane);
        });
      }
      planes = [];
      basePlanes = [];
    }

    function addToScene() {
      console.log(new Error());
      var tMeshParent: any = scene.getScene();    // should be Three.scene or three.Object3D

      if (HierarchyConfig.CreateHierarchy) {
        var tObj = new THREE.Object3D();
        scene.getScene().add(tObj);
        var tId = HierarchyConfig.Prefix + (HierarchyConfig.FirstFreeNumber) + (HierarchyConfig.PrefixLevel ? "" : HierarchyConfig.Postfix);
        tObj.name = tId;
        tMeshParent = tObj;
        scope.id = tId;

        if (HierarchyConfig.PrefixLevel == true) {
          var tImmObj = new THREE.Object3D();
          tImmObj.name = HierarchyConfig.Prefix + (HierarchyConfig.FirstFreeNumber) + HierarchyConfig.Postfix;
          tObj.add(tImmObj);
          tMeshParent = tImmObj;
        }
        HierarchyConfig.FirstFreeNumber++;

      } else {
        
      }
        
      planes.forEach((plane) => {
          tMeshParent.add(plane);

      });
      basePlanes.forEach((plane) => {
        tMeshParent.add(plane);
      });
      updateVisibility();

      var tResult = [];
      tResult.push(planes);
      tResult.push(basePlanes);
      console.log(tResult);
      return tResult;
    }

    function updateVisibility() {
        console.warn("three/edge.ts   updateVisibility destroyed by nm");
        return;

      // finds the normal from the specified edge
      var start = edge.interiorStart();
      var end = edge.interiorEnd();
      var x = end.x - start.x;
      var y = end.y - start.y;
      // rotate 90 degrees CCW
      var normal = new THREE.Vector3(-y, 0, x);
      normal.normalize();

      // setup camera
      var position = controls.object.position.clone();
      var focus = new THREE.Vector3(
        (start.x + end.x) / 2.0,
        0,
        (start.y + end.y) / 2.0);
      var direction = position.sub(focus).normalize();

      // find dot
      var dot = normal.dot(direction);

      // update visible
      scope.visible = (dot >= 0);

      // show or hide plans
      planes.forEach((plane) => {
        plane.visible = scope.visible;
      });

      updateObjectVisibility();
    }

    function updateObjectVisibility() {
      wall.items.forEach((item) => {
        (<BP3D.Items.WallItem>item).updateEdgeVisibility(scope.visible, front);
      });
      wall.onItems.forEach((item) => {
        (<BP3D.Items.WallItem>item).updateEdgeVisibility(scope.visible, front);
      });
    }

    function updateTexture(callback?) {
      // callback is fired when texture loads
      callback = callback || function () {
        scene.needsUpdate = true;
      }
      var textureData = edge.getTexture();
      var stretch = textureData.stretch;
      var url = textureData.url;
      var scale = textureData.scale;

      texture = THREE.ImageUtils.loadTexture(url, null, callback);

      if (!stretch) {
        var height = wall.height;
        var width = edge.interiorDistance();
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(width / scale, height / scale);
        texture.needsUpdate = true;
      }
    }

    function updatePlanes() {
      var wallMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        // ambientColor: 0xffffff, TODO_Ekki
        //ambient: scope.wall.color,
        side: THREE.FrontSide,
        map: texture,
        // lightMap: lightMap TODO_Ekki
      });

      var fillerMaterial = new THREE.MeshBasicMaterial({
        color: fillerColor,
        side: THREE.DoubleSide
      });


    
      // exterior plane
      console.log("-----------exterior plane:");
      var tExterior = makeWall(
          edge.exteriorStart(),
          edge.exteriorEnd(),
          edge.exteriorTransform,
          edge.invExteriorTransform,
          fillerMaterial);
      tExterior["SpecialMeshName"] = "Exterior";
      planes.push(tExterior);

      // interior plane
      console.log("-----------interior plane:");
      var tInterior = makeWall(
          edge.interiorStart(),
          edge.interiorEnd(),
          edge.interiorTransform,
          edge.invInteriorTransform,
          wallMaterial);

      tInterior["SpecialMeshName"] = "Interior";
      planes.push(tInterior);

      // bottom
      // put into basePlanes since this is always visible
      var tBottom = buildFiller(
          edge, 0,
          THREE.BackSide, baseColor);

      tBottom["SpecialMeshName"] = "Bottom";
      basePlanes.push(tBottom);

      // top
      var tTopMesh = buildFiller(
          edge, wall.height,
          THREE.DoubleSide, fillerColor);
      tTopMesh["SpecialMeshName"] = "Top";
      planes.push(tTopMesh);

      // sides
      var tSide1 = buildSideFillter(
          edge.interiorStart(), edge.exteriorStart(),
          wall.height, sideColor);
      tSide1["SpecialMeshName"] = "Side";
      planes.push(tSide1);

      var tSide2 = buildSideFillter(
          edge.interiorEnd(), edge.exteriorEnd(),
          wall.height, sideColor);
      tSide2["SpecialMeshName"] = "Side";

      planes.push(tSide2);


      console.log(planes);
    }

    // start, end have x and y attributes (i.e. corners)
    function makeWall(start, end, transform, invTransform, material) {
      var v1 = toVec3(start);
      var v2 = toVec3(end);
      var v3 = v2.clone();
      v3.y = wall.height;
      var v4 = v1.clone();
      v4.y = wall.height;

      var points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

      points.forEach((p) => {
        p.applyMatrix4(transform);
      });

      var shape = new THREE.Shape([
        new THREE.Vector2(points[0].x, points[0].y),
        new THREE.Vector2(points[1].x, points[1].y),
        new THREE.Vector2(points[2].x, points[2].y),
        new THREE.Vector2(points[3].x, points[3].y)
      ]);

      console.log("makeWall creates Shape the following way:");
      console.log(points[0].x, points[0].y);
      console.log(points[1].x, points[1].y);
      console.log(points[2].x, points[2].y);
      console.log(points[3].x, points[3].y);




      // add holes for each wall item
      wall.items.forEach((item) => {
        var pos = item.position.clone();
        pos.applyMatrix4(transform)
        var halfSize = item.halfSize;
        var min = halfSize.clone().multiplyScalar(-1);
        var max = halfSize.clone();
        min.add(pos);
        max.add(pos);

        var holePoints = [
          new THREE.Vector2(min.x, min.y),
          new THREE.Vector2(max.x, min.y),
          new THREE.Vector2(max.x, max.y),
          new THREE.Vector2(min.x, max.y)
        ];

        shape.holes.push(new THREE.Path(holePoints));
      });

      var geometry = new THREE.ShapeGeometry(shape);
      console.log("unmodified shape geometry nwas:");	
      console.log(JSON.stringify(geometry.vertices));

      geometry.vertices.forEach((v) => {
        v.applyMatrix4(invTransform);
      });

      console.log("moved and rotated");
      console.log(JSON.stringify(geometry.vertices));

      var translation = new THREE.Vector3(),
          rotationq = new THREE.Quaternion(),
          scale = new THREE.Vector3();

      invTransform.decompose(translation, rotationq, scale);


      var rotation = new THREE.Euler(0,0,0,"XYZ");
      rotation.setFromQuaternion(rotationq, "XYZ");

      console.log(JSON.stringify({tra:translation, rot:rotation,sca:scale}));
      
      // make UVs
      var totalDistance = Core.Utils.distance(v1.x, v1.z, v2.x, v2.z);
      var height = wall.height;
      geometry.faceVertexUvs[0] = [];

      function vertexToUv(vertex) {
        var x = Core.Utils.distance(v1.x, v1.z, vertex.x, vertex.z) / totalDistance;
        var y = vertex.y / height;
        return new THREE.Vector2(x, y);
      }

      geometry.faces.forEach((face) => {
        var vertA = geometry.vertices[face.a];
        var vertB = geometry.vertices[face.b];
        var vertC = geometry.vertices[face.c];
        geometry.faceVertexUvs[0].push([
          vertexToUv(vertA),
          vertexToUv(vertB),
          vertexToUv(vertC)]);
      });

      geometry.faceVertexUvs[1] = geometry.faceVertexUvs[0];

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      var mesh = new THREE.Mesh(
        geometry,
        material);

      return mesh;
    }

    function buildSideFillter(p1, p2, height, color) {
      var points = [
        toVec3(p1),
        toVec3(p2),
        toVec3(p2, height),
        toVec3(p1, height)
      ];

      var geometry = new THREE.Geometry();
      points.forEach((p) => {
        geometry.vertices.push(p);
      });
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      geometry.faces.push(new THREE.Face3(0, 2, 3));

      var fillerMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      });

      var filler = new THREE.Mesh(geometry, fillerMaterial);
      return filler;
    }

    function buildFiller(edge, height, side, color) {
      var points = [
        toVec2(edge.exteriorStart()),
        toVec2(edge.exteriorEnd()),
        toVec2(edge.interiorEnd()),
        toVec2(edge.interiorStart())
        ];

      console.log("TOP buildfiller mesh generated:" + JSON.stringify(points));


      var fillerMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: side
      });

      var shape = new THREE.Shape(points);
      var geometry = new THREE.ShapeGeometry(shape);

      var filler = new THREE.Mesh(geometry, fillerMaterial);
      filler.rotation.set(Math.PI / 2, 0, 0);
      filler.position.y = height;
      return filler;
    }

    function toVec2(pos) {
      return new THREE.Vector2(pos.x, pos.y);
    }

    function toVec3(pos, height?) {
      height = height || 0;
      return new THREE.Vector3(pos.x, height, pos.y);
    }

    scope.meshes = init();
  }
}
