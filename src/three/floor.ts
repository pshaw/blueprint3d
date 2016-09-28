/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />

module BP3D.Three {
    export var Floor = function (scene: BP3D.Model.Scene, room: BP3D.Model.Room) {
    
    var scope = this;

    this.room = room;
    var scene = scene;

    var floorPlane = null;
    var roofPlane = null;
    var id = null;

    init();

    function init() {
      scope.room.fireOnFloorChange(redraw);
      floorPlane = buildFloor();
      // roofs look weird, so commented out
      //roofPlane = buildRoof();
    }

    function redraw() {
      scope.removeFromScene();
      floorPlane = buildFloor();
      scope.addToScene();
    }

    function buildFloor() {
      var textureSettings = scope.room.getTexture();
      var floorTexture = THREE.ImageUtils.loadTexture(textureSettings.url);
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(1, 1);
      var floorMaterialTop = new THREE.MeshPhongMaterial({
        map: floorTexture,
        side: THREE.DoubleSide,
        // ambient: 0xffffff, TODO_Ekki
        color: 0xcccccc,
        specular: 0x0a0a0a
      });

      var textureScale = 1; // used to correctly set uv coords 1*1m based        textureSettings.scale;
      // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
      // scale down coords to fit 0 -> 1, then rescale

      var points = [];
      scope.room.interiorCorners.forEach((corner) => {
        points.push(new THREE.Vector2(
          corner.x / textureScale,
          corner.y / textureScale));
        console.log("Roompoint:", corner);
      });
      console.log(scope.room);

     

      var shape = new THREE.Shape(points);

      var geometry = new THREE.ShapeGeometry(shape);

      var floor = new THREE.Mesh(geometry, floorMaterialTop);

      var tPtIds = [];
      scope.room.corners.forEach(function (p) {
          tPtIds.push(p.id);
      });

      floor["SpecialMeshSortedPoints"] = tPtIds.sort().join(",");

      floor.rotation.set(Math.PI / 2, 0, 0);  //NM EXP was 90 degrees, for debug set to PI / 8
      floor.scale.set(textureScale, textureScale, textureScale);
      floor.receiveShadow = true;
      floor.castShadow = false;
      return floor;
    }

    function buildRoof() {
      // setup texture
      var roofMaterial = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: 0xe5e5e5
      });

      var points = [];
      scope.room.interiorCorners.forEach((corner) => {
        points.push(new THREE.Vector2(
          corner.x,
          corner.y));
      });
      var shape = new THREE.Shape(points);
      var geometry = new THREE.ShapeGeometry(shape);
      console.log("create roof");
      var roof = new THREE.Mesh(geometry, roofMaterial);
      roof["SpecialMeshName"] = "Roof";	
      roof.rotation.set(Math.PI / 2, 0, 0);
      roof.position.y = 250;
      return roof;
    }

    this.addToScene = function () {
      if (HierarchyConfig.CreateHierarchy) {
        var tObj = new THREE.Object3D();
        scene.getScene().add(tObj);
        var tId = HierarchyConfig.Prefix + (HierarchyConfig.FirstFreeNumber) + (HierarchyConfig.PrefixLevel ? "" : HierarchyConfig.Postfix);
        tObj.name = tId;
        var tMeshParent = tObj;
        scope.id = tId;
        if (HierarchyConfig.PrefixLevel == true) {
          var tImmObj = new THREE.Object3D();
          tImmObj.name = HierarchyConfig.Prefix + (HierarchyConfig.FirstFreeNumber) + HierarchyConfig.Postfix;
          tObj.add(tImmObj);
          tMeshParent = tImmObj;
        }
        HierarchyConfig.FirstFreeNumber++;
        tMeshParent.add(floorPlane);
        console.log("floor.addToScene will return ", tObj);
        return tObj; //NM HACK
      }
      else {
        scene.add(floorPlane);
        // hack so we can do intersect testing
        // Todo roofplane handling
        scene.add(room.floorPlane);

        console.log("floor.addToScene will return (nonhierarchy)", floorPlane);
        return floorPlane; //NM HACK
      }
    }

    this.removeFromScene = function () {
      if (HierarchyConfig.CreateHierarchy) {
        var selectedObject = scene.getScene().getObjectByName(scope.id);
        scene.getScene().remove(selectedObject);
      } else {
        scene.remove(floorPlane);
        //scene.remove(roofPlane);
        scene.remove(room.floorPlane);
        }
    }
  }
}
