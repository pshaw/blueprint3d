var BP3D;
(function (BP3D) {
    var Core;
    (function (Core) {
        /** Collection of utility functions. */
        var Utils = (function () {
            function Utils() {
            }
            /** Determines the distance of a point from a line.
             * @param x Point's x coordinate.
             * @param y Point's y coordinate.
             * @param x1 Line-Point 1's x coordinate.
             * @param y1 Line-Point 1's y coordinate.
             * @param x2 Line-Point 2's x coordinate.
             * @param y2 Line-Point 2's y coordinate.
             * @returns The distance.
             */
            Utils.pointDistanceFromLine = function (x, y, x1, y1, x2, y2) {
                var tPoint = Utils.closestPointOnLine(x, y, x1, y1, x2, y2);
                var tDx = x - tPoint.x;
                var tDy = y - tPoint.y;
                return Math.sqrt(tDx * tDx + tDy * tDy);
            };
            /** Gets the projection of a point onto a line.
             * @param x Point's x coordinate.
             * @param y Point's y coordinate.
             * @param x1 Line-Point 1's x coordinate.
             * @param y1 Line-Point 1's y coordinate.
             * @param x2 Line-Point 2's x coordinate.
             * @param y2 Line-Point 2's y coordinate.
             * @returns The point.
             */
            Utils.closestPointOnLine = function (x, y, x1, y1, x2, y2) {
                // Inspired by: http://stackoverflow.com/a/6853926
                var tA = x - x1;
                var tB = y - y1;
                var tC = x2 - x1;
                var tD = y2 - y1;
                var tDot = tA * tC + tB * tD;
                var tLenSq = tC * tC + tD * tD;
                var tParam = tDot / tLenSq;
                var tXx, tYy;
                if (tParam < 0 || (x1 == x2 && y1 == y2)) {
                    tXx = x1;
                    tYy = y1;
                }
                else if (tParam > 1) {
                    tXx = x2;
                    tYy = y2;
                }
                else {
                    tXx = x1 + tParam * tC;
                    tYy = y1 + tParam * tD;
                }
                return {
                    x: tXx,
                    y: tYy
                };
            };
            /** Gets the distance of two points.
             * @param x1 X part of first point.
             * @param y1 Y part of first point.
             * @param x2 X part of second point.
             * @param y2 Y part of second point.
             * @returns The distance.
             */
            Utils.distance = function (x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) +
                    Math.pow(y2 - y1, 2));
            };
            /**  Gets the angle between 0,0 -> x1,y1 and 0,0 -> x2,y2 (-pi to pi)
             * @returns The angle.
             */
            Utils.angle = function (x1, y1, x2, y2) {
                var tDot = x1 * x2 + y1 * y2;
                var tDet = x1 * y2 - y1 * x2;
                var tAngle = -Math.atan2(tDet, tDot);
                return tAngle;
            };
            /** shifts angle to be 0 to 2pi */
            Utils.angle2pi = function (x1, y1, x2, y2) {
                var tTheta = Utils.angle(x1, y1, x2, y2);
                if (tTheta < 0) {
                    tTheta += 2 * Math.PI;
                }
                return tTheta;
            };
            /** Checks if an array of points is clockwise.
             * @param points Is array of points with x,y attributes
             * @returns True if clockwise.
             */
            Utils.isClockwise = function (points) {
                // make positive
                var tSubX = Math.min(0, Math.min.apply(null, Utils.map(points, function (p) {
                    return p.x;
                })));
                var tSubY = Math.min(0, Math.min.apply(null, Utils.map(points, function (p) {
                    return p.x;
                })));
                var tNewPoints = Utils.map(points, function (p) {
                    return {
                        x: p.x - tSubX,
                        y: p.y - tSubY
                    };
                });
                // determine CW/CCW, based on:
                // http://stackoverflow.com/questions/1165647
                var tSum = 0;
                for (var tI = 0; tI < tNewPoints.length; tI++) {
                    var tC1 = tNewPoints[tI];
                    var tC2;
                    if (tI == tNewPoints.length - 1) {
                        tC2 = tNewPoints[0];
                    }
                    else {
                        tC2 = tNewPoints[tI + 1];
                    }
                    tSum += (tC2.x - tC1.x) * (tC2.y + tC1.y);
                }
                return (tSum >= 0);
            };
            /** Creates a Guid.
             * @returns A new Guid.
             */
            Utils.guid = function () {
                var tS4 = function () {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                };
                return tS4() + tS4() + '-' + tS4() + '-' + tS4() + '-' +
                    tS4() + '-' + tS4() + tS4() + tS4();
            };
            /** both arguments are arrays of corners with x,y attributes */
            Utils.polygonPolygonIntersect = function (firstCorners, secondCorners) {
                for (var tI = 0; tI < firstCorners.length; tI++) {
                    var tFirstCorner = firstCorners[tI], tSecondCorner;
                    if (tI == firstCorners.length - 1) {
                        tSecondCorner = firstCorners[0];
                    }
                    else {
                        tSecondCorner = firstCorners[tI + 1];
                    }
                    if (Utils.linePolygonIntersect(tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y, secondCorners)) {
                        return true;
                    }
                }
                return false;
            };
            /** Corners is an array of points with x,y attributes */
            Utils.linePolygonIntersect = function (x1, y1, x2, y2, corners) {
                for (var tI = 0; tI < corners.length; tI++) {
                    var tFirstCorner = corners[tI], tSecondCorner;
                    if (tI == corners.length - 1) {
                        tSecondCorner = corners[0];
                    }
                    else {
                        tSecondCorner = corners[tI + 1];
                    }
                    if (Utils.lineLineIntersect(x1, y1, x2, y2, tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y)) {
                        return true;
                    }
                }
                return false;
            };
            /** */
            Utils.lineLineIntersect = function (x1, y1, x2, y2, x3, y3, x4, y4) {
                function tCCW(p1, p2, p3) {
                    var tA = p1.x, tB = p1.y, tC = p2.x, tD = p2.y, tE = p3.x, tF = p3.y;
                    return (tF - tB) * (tC - tA) > (tD - tB) * (tE - tA);
                }
                var tP1 = { x: x1, y: y1 }, tP2 = { x: x2, y: y2 }, tP3 = { x: x3, y: y3 }, tP4 = { x: x4, y: y4 };
                return (tCCW(tP1, tP3, tP4) != tCCW(tP2, tP3, tP4)) && (tCCW(tP1, tP2, tP3) != tCCW(tP1, tP2, tP4));
            };
            /**
             @param corners Is an array of points with x,y attributes
              @param startX X start coord for raycast
              @param startY Y start coord for raycast
            */
            Utils.pointInPolygon = function (x, y, corners, startX, startY) {
                startX = startX || 0;
                startY = startY || 0;
                //ensure that point(startX, startY) is outside the polygon consists of corners
                var tMinX = 0, tMinY = 0;
                if (startX === undefined || startY === undefined) {
                    for (var tI = 0; tI < corners.length; tI++) {
                        tMinX = Math.min(tMinX, corners[tI].x);
                        tMinY = Math.min(tMinX, corners[tI].y);
                    }
                    startX = tMinX - 10;
                    startY = tMinY - 10;
                }
                var tIntersects = 0;
                for (var tI = 0; tI < corners.length; tI++) {
                    var tFirstCorner = corners[tI], tSecondCorner;
                    if (tI == corners.length - 1) {
                        tSecondCorner = corners[0];
                    }
                    else {
                        tSecondCorner = corners[tI + 1];
                    }
                    if (Utils.lineLineIntersect(startX, startY, x, y, tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y)) {
                        tIntersects++;
                    }
                }
                // odd intersections means the point is in the polygon
                return ((tIntersects % 2) == 1);
            };
            /** Checks if all corners of insideCorners are inside the polygon described by outsideCorners */
            Utils.polygonInsidePolygon = function (insideCorners, outsideCorners, startX, startY) {
                startX = startX || 0;
                startY = startY || 0;
                for (var tI = 0; tI < insideCorners.length; tI++) {
                    if (!Utils.pointInPolygon(insideCorners[tI].x, insideCorners[tI].y, outsideCorners, startX, startY)) {
                        return false;
                    }
                }
                return true;
            };
            /** Checks if any corners of firstCorners is inside the polygon described by secondCorners */
            Utils.polygonOutsidePolygon = function (insideCorners, outsideCorners, startX, startY) {
                startX = startX || 0;
                startY = startY || 0;
                for (var tI = 0; tI < insideCorners.length; tI++) {
                    if (Utils.pointInPolygon(insideCorners[tI].x, insideCorners[tI].y, outsideCorners, startX, startY)) {
                        return false;
                    }
                }
                return true;
            };
            // arrays
            Utils.forEach = function (array, action) {
                for (var tI = 0; tI < array.length; tI++) {
                    action(array[tI]);
                }
            };
            Utils.forEachIndexed = function (array, action) {
                for (var tI = 0; tI < array.length; tI++) {
                    action(tI, array[tI]);
                }
            };
            Utils.map = function (array, func) {
                var tResult = [];
                array.forEach(function (element) {
                    tResult.push(func(element));
                });
                return tResult;
            };
            /** Remove elements in array if func(element) returns true */
            Utils.removeIf = function (array, func) {
                var tResult = [];
                array.forEach(function (element) {
                    if (!func(element)) {
                        tResult.push(element);
                    }
                });
                return tResult;
            };
            /** Shift the items in an array by shift (positive integer) */
            Utils.cycle = function (arr, shift) {
                var tReturn = arr.slice(0);
                for (var tI = 0; tI < shift; tI++) {
                    var tmp = tReturn.shift();
                    tReturn.push(tmp);
                }
                return tReturn;
            };
            /** Returns in the unique elemnts in arr */
            Utils.unique = function (arr, hashFunc) {
                var tResults = [];
                var tMap = {};
                for (var tI = 0; tI < arr.length; tI++) {
                    if (!tMap.hasOwnProperty(arr[tI])) {
                        tResults.push(arr[tI]);
                        tMap[hashFunc(arr[tI])] = true;
                    }
                }
                return tResults;
            };
            /** Remove value from array, if it is present */
            Utils.removeValue = function (array, value) {
                for (var tI = array.length - 1; tI >= 0; tI--) {
                    if (array[tI] === value) {
                        array.splice(tI, 1);
                    }
                }
            };
            /** Subtracts the elements in subArray from array */
            Utils.subtract = function (array, subArray) {
                return Utils.removeIf(array, function (el) {
                    return Utils.hasValue(subArray, el);
                });
            };
            /** Checks if value is in array */
            Utils.hasValue = function (array, value) {
                for (var tI = 0; tI < array.length; tI++) {
                    if (array[tI] === value) {
                        return true;
                    }
                }
                return false;
            };
            return Utils;
        })();
        Core.Utils = Utils;
    })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../core/configuration.ts" />
var BP3D;
(function (BP3D) {
    var Core;
    (function (Core) {
        /** Dimensioning in Inch. */
        Core.dimInch = "inch";
        /** Dimensioning in Meter. */
        Core.dimMeter = "m";
        /** Dimensioning in Centi Meter. */
        Core.dimCentiMeter = "cm";
        /** Dimensioning in Milli Meter. */
        Core.dimMilliMeter = "mm";
        /** Dimensioning functions. */
        var Dimensioning = (function () {
            function Dimensioning() {
            }
            /** Converts cm to dimensioning string.
             * @param cm Centi meter value to be converted.
             * @returns String representation.
             */
            Dimensioning.cmToMeasure = function (cm) {
                switch (Core.Configuration.getStringValue(Core.configDimUnit)) {
                    case Core.dimInch:
                        var realFeet = ((cm * 0.393700) / 12);
                        var feet = Math.floor(realFeet);
                        var inches = Math.round((realFeet - feet) * 12);
                        return feet + "'" + inches + '"';
                    case Core.dimMilliMeter:
                        return "" + Math.round(10 * cm) + " mm";
                    case Core.dimCentiMeter:
                        return "" + Math.round(10 * cm) / 10 + " cm";
                    case Core.dimMeter:
                    default:
                        return "" + Math.round(10 * cm) / 1000 + " m";
                }
            };
            return Dimensioning;
        })();
        Core.Dimensioning = Dimensioning;
    })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
/// <reference path="dimensioning.ts" />
var BP3D;
(function (BP3D) {
    var Core;
    (function (Core) {
        // FLOORPLANNER:
        /** Floorplanner: The dimensioning unit for 2D floorplan measurements. */
        Core.configDimUnit = "dimUnit";
        /** Floorplanner: The grid spacing in Pixels. */
        Core.configGridSpacing = "gridSpacing";
        /** Floorplanner: The grid width in Pixels. */
        Core.configGridWidth = "gridWidth";
        /** Floorplanner: The color of the grid. */
        Core.configGridColor = "gridColor";
        /** Floorplanner: The color of the room. */
        Core.configRoomColor = "roomColor";
        /** Floorplanner: The wall width in Pixels. */
        Core.configWallWidth = "wallWidth";
        /** Floorplanner: The wall width (hover mode) in Pixels. */
        Core.configWallWidthHover = "wallWidthHover";
        /** Floorplanner: The wall color. */
        Core.configWallColor = "wallColor";
        /** Floorplanner: The wall color (hover mode). */
        Core.configWallColorHover = "wallColorHover";
        /** Floorplanner: The edge width in Pixels. */
        Core.configEdgeWidth = "edgeWidth";
        /** Floorplanner: The edge color. */
        Core.configEdgeColor = "edgeColor";
        /** Floorplanner: The edge color (hover mode). */
        Core.configEdgeColorHover = "edgeColorHover";
        /** Floorplanner: The color in delete mode. */
        Core.configDeleteColor = "deleteColor";
        /** Floorplanner: The corner radius in Pixels. */
        Core.configCornerRadius = "cornerRadius";
        /** Floorplanner: The corner radius (Hover mode) in Pixels. */
        Core.configCornerRadiusHover = "cornerRadiusHover";
        /** Floorplanner: The corner color. */
        Core.configCornerColor = "cornerColor";
        /** Floorplanner: The corner color (hover mode). */
        Core.configCornerColorHover = "cornerColorHover";
        // WALL:
        /** Wall: The initial wall height in cm. */
        Core.configWallHeight = "wallHeight";
        /** Wall: The initial wall thickness in cm. */
        Core.configWallThickness = "wallThickness";
        /** Global configuration to customize the whole system.  */
        var Configuration = (function () {
            function Configuration() {
            }
            /** Set a configuration parameter. */
            Configuration.setValue = function (key, value) {
                this.data[key] = value;
            };
            /** Get a string configuration parameter. */
            Configuration.getStringValue = function (key) {
                switch (key) {
                    case Core.configDimUnit:
                    case Core.configGridColor:
                    case Core.configRoomColor:
                    case Core.configWallColor:
                    case Core.configWallColorHover:
                    case Core.configEdgeColor:
                    case Core.configEdgeColorHover:
                    case Core.configDeleteColor:
                    case Core.configCornerColor:
                    case Core.configCornerColorHover:
                        return this.data[key];
                    default:
                        throw new Error("Invalid string configuration parameter: " + key);
                }
            };
            /** Get a numeric configuration parameter. */
            Configuration.getNumericValue = function (key) {
                switch (key) {
                    case Core.configGridSpacing:
                    case Core.configGridWidth:
                    case Core.configWallWidth:
                    case Core.configWallWidthHover:
                    case Core.configEdgeWidth:
                    case Core.configCornerRadius:
                    case Core.configCornerRadiusHover:
                    case Core.configWallHeight:
                    case Core.configWallThickness:
                        return this.data[key];
                    default:
                        throw new Error("Invalid numeric configuration parameter: " + key);
                }
            };
            /** Configuration data loaded from/stored to extern. */
            Configuration.data = {
                dimUnit: Core.dimInch,
                gridSpacing: 20,
                gridWidth: 1,
                gridColor: "#f1f1f1",
                roomColor: "#f9f9f9",
                wallWidth: 5,
                wallWidthHover: 7,
                wallColor: "#dddddd",
                wallColorHover: "#008cba",
                edgeWidth: 1,
                edgeColor: "#888888",
                edgeColorHover: "#008cba",
                deleteColor: "#ff0000",
                cornerRadius: 0,
                cornerRadiusHover: 7,
                cornerColor: "#cccccc",
                cornerColorHover: "#008cba",
                wallHeight: 250,
                wallThickness: 10
            };
            return Configuration;
        })();
        Core.Configuration = Configuration;
    })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="metadata.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /**
         * An Item is an abstract entity for all things placed in the scene,
         * e.g. at walls or on the floor.
         */
        var Item = (function (_super) {
            __extends(Item, _super);
            /** Constructs an item.
             * @param model TODO
             * @param metadata TODO
             * @param geometry TODO
             * @param material TODO
             * @param position TODO
             * @param rotation TODO
             * @param scale TODO
             */
            function Item(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this);
                this.model = model;
                this.metadata = metadata;
                /** */
                this.errorGlow = new THREE.Mesh();
                /** */
                this.hover = false;
                /** */
                this.selected = false;
                /** */
                this.highlighted = false;
                /** */
                this.error = false;
                /** */
                this.emissiveColor = 0x444444;
                /** */
                this.errorColor = 0xff0000;
                /** Does this object affect other floor items */
                this.obstructFloorMoves = true;
                /** Show rotate option in context menu */
                this.allowRotate = true;
                /** */
                this.fixed = false;
                /** dragging */
                this.dragOffset = new THREE.Vector3();
                /** */
                this.getHeight = function () {
                    return this.halfSize.y * 2.0;
                };
                /** */
                this.getWidth = function () {
                    return this.halfSize.x * 2.0;
                };
                /** */
                this.getDepth = function () {
                    return this.halfSize.z * 2.0;
                };
                /** */
                this.initObject = function () {
                    this.placeInRoom();
                    // select and stuff
                    this.scene.needsUpdate = true;
                };
                this.scene = this.model.scene;
                this.geometry = geometry;
                this.material = material;
                this.errorColor = 0xff0000;
                this.resizable = metadata.resizable;
                this.castShadow = true;
                this.receiveShadow = false;
                this.geometry = geometry;
                this.material = material;
                if (position) {
                    this.position.copy(position);
                    this.position_set = true;
                }
                else {
                    this.position_set = false;
                }
                // center in its boundingbox
                this.geometry.computeBoundingBox();
                this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-0.5 * (this.geometry.boundingBox.max.x + this.geometry.boundingBox.min.x), -0.5 * (this.geometry.boundingBox.max.y + this.geometry.boundingBox.min.y), -0.5 * (this.geometry.boundingBox.max.z + this.geometry.boundingBox.min.z)));
                this.geometry.computeBoundingBox();
                this.halfSize = this.objectHalfSize();
                if (rotation) {
                    this.rotation.y = rotation;
                }
                if (scale != null) {
                    this.setScale(scale.x, scale.y, scale.z);
                }
            }
            ;
            /** */
            Item.prototype.remove = function () {
                this.scene.removeItem(this);
            };
            ;
            /** */
            Item.prototype.resize = function (height, width, depth) {
                var x = width / this.getWidth();
                var y = height / this.getHeight();
                var z = depth / this.getDepth();
                this.setScale(x, y, z);
            };
            /** */
            Item.prototype.setScale = function (x, y, z) {
                var scaleVec = new THREE.Vector3(x, y, z);
                this.halfSize.multiply(scaleVec);
                scaleVec.multiply(this.scale);
                this.scale.set(scaleVec.x, scaleVec.y, scaleVec.z);
                this.resized();
                this.scene.needsUpdate = true;
            };
            ;
            /** */
            Item.prototype.setFixed = function (fixed) {
                this.fixed = fixed;
            };
            /** */
            Item.prototype.removed = function () {
            };
            /** on is a bool */
            Item.prototype.updateHighlight = function () {
                var on = this.hover || this.selected;
                this.highlighted = on;
                var hex = on ? this.emissiveColor : 0x000000;
                this.material.materials.forEach(function (material) {
                    // TODO_Ekki emissive doesn't exist anymore?
                    material.emissive.setHex(hex);
                });
            };
            /** */
            Item.prototype.mouseOver = function () {
                this.hover = true;
                this.updateHighlight();
            };
            ;
            /** */
            Item.prototype.mouseOff = function () {
                this.hover = false;
                this.updateHighlight();
            };
            ;
            /** */
            Item.prototype.setSelected = function () {
                this.selected = true;
                this.updateHighlight();
            };
            ;
            /** */
            Item.prototype.setUnselected = function () {
                this.selected = false;
                this.updateHighlight();
            };
            ;
            /** intersection has attributes point (vec3) and object (THREE.Mesh) */
            Item.prototype.clickPressed = function (intersection) {
                this.dragOffset.copy(intersection.point).sub(this.position);
            };
            ;
            /** */
            Item.prototype.clickDragged = function (intersection) {
                if (intersection) {
                    this.moveToPosition(intersection.point.sub(this.dragOffset), intersection);
                }
            };
            ;
            /** */
            Item.prototype.rotate = function (intersection) {
                if (intersection) {
                    var angle = BP3D.Core.Utils.angle(0, 1, intersection.point.x - this.position.x, intersection.point.z - this.position.z);
                    var snapTolerance = Math.PI / 16.0;
                    // snap to intervals near Math.PI/2
                    for (var i = -4; i <= 4; i++) {
                        if (Math.abs(angle - (i * (Math.PI / 2))) < snapTolerance) {
                            angle = i * (Math.PI / 2);
                            break;
                        }
                    }
                    this.rotation.y = angle;
                }
            };
            /** */
            Item.prototype.moveToPosition = function (vec3, intersection) {
                this.position.copy(vec3);
            };
            /** */
            Item.prototype.clickReleased = function () {
                if (this.error) {
                    this.hideError();
                }
            };
            ;
            /**
             * Returns an array of planes to use other than the ground plane
             * for passing intersection to clickPressed and clickDragged
             */
            Item.prototype.customIntersectionPlanes = function () {
                return [];
            };
            /**
             * returns the 2d corners of the bounding polygon
             *
             * offset is Vector3 (used for getting corners of object at a new position)
             *
             * TODO: handle rotated objects better!
             */
            Item.prototype.getCorners = function (xDim, yDim, position) {
                position = position || this.position;
                var halfSize = this.halfSize.clone();
                var c1 = new THREE.Vector3(-halfSize.x, 0, -halfSize.z);
                var c2 = new THREE.Vector3(halfSize.x, 0, -halfSize.z);
                var c3 = new THREE.Vector3(halfSize.x, 0, halfSize.z);
                var c4 = new THREE.Vector3(-halfSize.x, 0, halfSize.z);
                var transform = new THREE.Matrix4();
                //console.log(this.rotation.y);
                transform.makeRotationY(this.rotation.y); //  + Math.PI/2)
                c1.applyMatrix4(transform);
                c2.applyMatrix4(transform);
                c3.applyMatrix4(transform);
                c4.applyMatrix4(transform);
                c1.add(position);
                c2.add(position);
                c3.add(position);
                c4.add(position);
                //halfSize.applyMatrix4(transform);
                //var min = position.clone().sub(halfSize);
                //var max = position.clone().add(halfSize);
                var corners = [
                    { x: c1.x, y: c1.z },
                    { x: c2.x, y: c2.z },
                    { x: c3.x, y: c3.z },
                    { x: c4.x, y: c4.z }
                ];
                return corners;
            };
            /** */
            Item.prototype.showError = function (vec3) {
                vec3 = vec3 || this.position;
                if (!this.error) {
                    this.error = true;
                    this.errorGlow = this.createGlow(this.errorColor, 0.8, true);
                    this.scene.add(this.errorGlow);
                }
                this.errorGlow.position.copy(vec3);
            };
            /** */
            Item.prototype.hideError = function () {
                if (this.error) {
                    this.error = false;
                    this.scene.remove(this.errorGlow);
                }
            };
            /** */
            Item.prototype.objectHalfSize = function () {
                var objectBox = new THREE.Box3();
                objectBox.setFromObject(this);
                return objectBox.max.clone().sub(objectBox.min).divideScalar(2);
            };
            /** */
            Item.prototype.createGlow = function (color, opacity, ignoreDepth) {
                ignoreDepth = ignoreDepth || false;
                opacity = opacity || 0.2;
                var glowMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    blending: THREE.AdditiveBlending,
                    opacity: 0.2,
                    transparent: true,
                    depthTest: !ignoreDepth
                });
                var glow = new THREE.Mesh(this.geometry.clone(), glowMaterial);
                glow.position.copy(this.position);
                glow.rotation.copy(this.rotation);
                glow.scale.copy(this.scale);
                return glow;
            };
            ;
            return Item;
        })(THREE.Mesh);
        Items.Item = Item;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="floorplan.ts" />
/// <reference path="wall.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /** */
        var cornerTolerance = 20;
        /**
         * Corners are used to define Walls.
         */
        var Corner = (function () {
            /** Constructs a corner.
             * @param floorplan The associated floorplan.
             * @param x X coordinate.
             * @param y Y coordinate.
             * @param id An optional unique id. If not set, created internally.
             */
            function Corner(floorplan, x, y, id) {
                this.floorplan = floorplan;
                this.x = x;
                this.y = y;
                this.id = id;
                /** Array of start walls. */
                this.wallStarts = [];
                /** Array of end walls. */
                this.wallEnds = [];
                /** Callbacks to be fired on movement. */
                this.moved_callbacks = $.Callbacks();
                /** Callbacks to be fired on removal. */
                this.deleted_callbacks = $.Callbacks();
                /** Callbacks to be fired in case of action. */
                this.action_callbacks = $.Callbacks();
                this.id = id || BP3D.Core.Utils.guid();
            }
            /** Add function to moved callbacks.
             * @param func The function to be added.
            */
            Corner.prototype.fireOnMove = function (func) {
                this.moved_callbacks.add(func);
            };
            /** Add function to deleted callbacks.
             * @param func The function to be added.
             */
            Corner.prototype.fireOnDelete = function (func) {
                this.deleted_callbacks.add(func);
            };
            /** Add function to action callbacks.
             * @param func The function to be added.
             */
            Corner.prototype.fireOnAction = function (func) {
                this.action_callbacks.add(func);
            };
            /**
             * @returns
             * @deprecated
             */
            Corner.prototype.getX = function () {
                return this.x;
            };
            /**
             * @returns
             * @deprecated
             */
            Corner.prototype.getY = function () {
                return this.y;
            };
            /**
             *
             */
            Corner.prototype.snapToAxis = function (tolerance) {
                // try to snap this corner to an axis
                var snapped = {
                    x: false,
                    y: false
                };
                var scope = this;
                this.adjacentCorners().forEach(function (corner) {
                    if (Math.abs(corner.x - scope.x) < tolerance) {
                        scope.x = corner.x;
                        snapped.x = true;
                    }
                    if (Math.abs(corner.y - scope.y) < tolerance) {
                        scope.y = corner.y;
                        snapped.y = true;
                    }
                });
                return snapped;
            };
            /** Moves corner relatively to new position.
             * @param dx The delta x.
             * @param dy The delta y.
             */
            Corner.prototype.relativeMove = function (dx, dy) {
                this.move(this.x + dx, this.y + dy);
            };
            Corner.prototype.fireAction = function (action) {
                this.action_callbacks.fire(action);
            };
            /** Remove callback. Fires the delete callbacks. */
            Corner.prototype.remove = function () {
                this.deleted_callbacks.fire(this);
            };
            /** Removes all walls. */
            Corner.prototype.removeAll = function () {
                for (var i = 0; i < this.wallStarts.length; i++) {
                    this.wallStarts[i].remove();
                }
                for (var i = 0; i < this.wallEnds.length; i++) {
                    this.wallEnds[i].remove();
                }
                this.remove();
            };
            /** Moves corner to new position.
             * @param newX The new x position.
             * @param newY The new y position.
             */
            Corner.prototype.move = function (newX, newY) {
                this.x = newX;
                this.y = newY;
                this.mergeWithIntersected();
                this.moved_callbacks.fire(this.x, this.y);
                this.wallStarts.forEach(function (wall) {
                    wall.fireMoved();
                });
                this.wallEnds.forEach(function (wall) {
                    wall.fireMoved();
                });
            };
            /** Gets the adjacent corners.
             * @returns Array of corners.
             */
            Corner.prototype.adjacentCorners = function () {
                var retArray = [];
                for (var i = 0; i < this.wallStarts.length; i++) {
                    retArray.push(this.wallStarts[i].getEnd());
                }
                for (var i = 0; i < this.wallEnds.length; i++) {
                    retArray.push(this.wallEnds[i].getStart());
                }
                return retArray;
            };
            /** Checks if a wall is connected.
             * @param wall A wall.
             * @returns True in case of connection.
             */
            Corner.prototype.isWallConnected = function (wall) {
                for (var i = 0; i < this.wallStarts.length; i++) {
                    if (this.wallStarts[i] == wall) {
                        return true;
                    }
                }
                for (var i = 0; i < this.wallEnds.length; i++) {
                    if (this.wallEnds[i] == wall) {
                        return true;
                    }
                }
                return false;
            };
            /**
             *
             */
            Corner.prototype.distanceFrom = function (x, y) {
                var distance = BP3D.Core.Utils.distance(x, y, this.x, this.y);
                //console.log('x,y ' + x + ',' + y + ' to ' + this.getX() + ',' + this.getY() + ' is ' + distance);
                return distance;
            };
            /** Gets the distance from a wall.
             * @param wall A wall.
             * @returns The distance.
             */
            Corner.prototype.distanceFromWall = function (wall) {
                return wall.distanceFrom(this.x, this.y);
            };
            /** Gets the distance from a corner.
             * @param corner A corner.
             * @returns The distance.
             */
            Corner.prototype.distanceFromCorner = function (corner) {
                return this.distanceFrom(corner.x, corner.y);
            };
            /** Detaches a wall.
             * @param wall A wall.
             */
            Corner.prototype.detachWall = function (wall) {
                BP3D.Core.Utils.removeValue(this.wallStarts, wall);
                BP3D.Core.Utils.removeValue(this.wallEnds, wall);
                if (this.wallStarts.length == 0 && this.wallEnds.length == 0) {
                    this.remove();
                }
            };
            /** Attaches a start wall.
             * @param wall A wall.
             */
            Corner.prototype.attachStart = function (wall) {
                this.wallStarts.push(wall);
            };
            /** Attaches an end wall.
             * @param wall A wall.
             */
            Corner.prototype.attachEnd = function (wall) {
                this.wallEnds.push(wall);
            };
            /** Get wall to corner.
             * @param corner A corner.
             * @return The associated wall or null.
             */
            Corner.prototype.wallTo = function (corner) {
                for (var i = 0; i < this.wallStarts.length; i++) {
                    if (this.wallStarts[i].getEnd() === corner) {
                        return this.wallStarts[i];
                    }
                }
                return null;
            };
            /** Get wall from corner.
             * @param corner A corner.
             * @return The associated wall or null.
             */
            Corner.prototype.wallFrom = function (corner) {
                for (var i = 0; i < this.wallEnds.length; i++) {
                    if (this.wallEnds[i].getStart() === corner) {
                        return this.wallEnds[i];
                    }
                }
                return null;
            };
            /** Get wall to or from corner.
             * @param corner A corner.
             * @return The associated wall or null.
             */
            Corner.prototype.wallToOrFrom = function (corner) {
                return this.wallTo(corner) || this.wallFrom(corner);
            };
            /**
             *
             */
            Corner.prototype.combineWithCorner = function (corner) {
                // update position to other corner's
                this.x = corner.x;
                this.y = corner.y;
                // absorb the other corner's wallStarts and wallEnds
                for (var i = corner.wallStarts.length - 1; i >= 0; i--) {
                    corner.wallStarts[i].setStart(this);
                }
                for (var i = corner.wallEnds.length - 1; i >= 0; i--) {
                    corner.wallEnds[i].setEnd(this);
                }
                // delete the other corner
                corner.removeAll();
                this.removeDuplicateWalls();
                this.floorplan.update();
            };
            Corner.prototype.mergeWithIntersected = function () {
                //console.log('mergeWithIntersected for object: ' + this.type);
                // check corners
                for (var i = 0; i < this.floorplan.getCorners().length; i++) {
                    var corner = this.floorplan.getCorners()[i];
                    if (this.distanceFromCorner(corner) < cornerTolerance && corner != this) {
                        this.combineWithCorner(corner);
                        return true;
                    }
                }
                // check walls
                for (var i = 0; i < this.floorplan.getWalls().length; i++) {
                    var wall = this.floorplan.getWalls()[i];
                    if (this.distanceFromWall(wall) < cornerTolerance && !this.isWallConnected(wall)) {
                        // update position to be on wall
                        var intersection = BP3D.Core.Utils.closestPointOnLine(this.x, this.y, wall.getStart().x, wall.getStart().y, wall.getEnd().x, wall.getEnd().y);
                        this.x = intersection.x;
                        this.y = intersection.y;
                        // merge this corner into wall by breaking wall into two parts
                        this.floorplan.newWall(this, wall.getEnd());
                        wall.setEnd(this);
                        this.floorplan.update();
                        return true;
                    }
                }
                return false;
            };
            /** Ensure we do not have duplicate walls (i.e. same start and end points) */
            Corner.prototype.removeDuplicateWalls = function () {
                // delete the wall between these corners, if it exists
                var wallEndpoints = {};
                var wallStartpoints = {};
                for (var i = this.wallStarts.length - 1; i >= 0; i--) {
                    if (this.wallStarts[i].getEnd() === this) {
                        // remove zero length wall 
                        this.wallStarts[i].remove();
                    }
                    else if (this.wallStarts[i].getEnd().id in wallEndpoints) {
                        // remove duplicated wall
                        this.wallStarts[i].remove();
                    }
                    else {
                        wallEndpoints[this.wallStarts[i].getEnd().id] = true;
                    }
                }
                for (var i = this.wallEnds.length - 1; i >= 0; i--) {
                    if (this.wallEnds[i].getStart() === this) {
                        // removed zero length wall 
                        this.wallEnds[i].remove();
                    }
                    else if (this.wallEnds[i].getStart().id in wallStartpoints) {
                        // removed duplicated wall
                        this.wallEnds[i].remove();
                    }
                    else {
                        wallStartpoints[this.wallEnds[i].getStart().id] = true;
                    }
                }
            };
            return Corner;
        })();
        Model.Corner = Corner;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/utils.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /**
         * Half Edges are created by Room.
         *
         * Once rooms have been identified, Half Edges are created for each interior wall.
         *
         * A wall can have two half edges if it is visible from both sides.
         */
        var HalfEdge = (function () {
            /**
             * Constructs a half edge.
             * @param room The associated room.
             * @param wall The corresponding wall.
             * @param front True if front side.
             */
            function HalfEdge(room, wall, front) {
                this.room = room;
                this.wall = wall;
                this.front = front;
                /** used for intersection testing... not convinced this belongs here */
                this.plane = null;
                /** transform from world coords to wall planes (z=0) */
                this.interiorTransform = new THREE.Matrix4();
                /** transform from world coords to wall planes (z=0) */
                this.invInteriorTransform = new THREE.Matrix4();
                /** transform from world coords to wall planes (z=0) */
                this.exteriorTransform = new THREE.Matrix4();
                /** transform from world coords to wall planes (z=0) */
                this.invExteriorTransform = new THREE.Matrix4();
                /** */
                this.redrawCallbacks = $.Callbacks();
                /**
                 * this feels hacky, but need wall items
                 */
                this.generatePlane = function () {
                    function transformCorner(corner) {
                        return new THREE.Vector3(corner.x, 0, corner.y);
                    }
                    var v1 = transformCorner(this.interiorStart());
                    var v2 = transformCorner(this.interiorEnd());
                    var v3 = v2.clone();
                    v3.y = this.wall.height;
                    var v4 = v1.clone();
                    v4.y = this.wall.height;
                    var geometry = new THREE.Geometry();
                    geometry.vertices = [v1, v2, v3, v4];
                    geometry.faces.push(new THREE.Face3(0, 1, 2));
                    geometry.faces.push(new THREE.Face3(0, 2, 3));
                    geometry.computeFaceNormals();
                    geometry.computeBoundingBox();
                    this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
                    this.plane.visible = false;
                    this.plane.edge = this; // js monkey patch
                    this.computeTransforms(this.interiorTransform, this.invInteriorTransform, this.interiorStart(), this.interiorEnd());
                    this.computeTransforms(this.exteriorTransform, this.invExteriorTransform, this.exteriorStart(), this.exteriorEnd());
                };
                this.front = front || false;
                this.offset = wall.thickness / 2.0;
                this.height = wall.height;
                if (this.front) {
                    this.wall.frontEdge = this;
                }
                else {
                    this.wall.backEdge = this;
                }
            }
            /**
             *
             */
            HalfEdge.prototype.getTexture = function () {
                if (this.front) {
                    return this.wall.frontTexture;
                }
                else {
                    return this.wall.backTexture;
                }
            };
            /**
             *
             */
            HalfEdge.prototype.setTexture = function (textureUrl, textureStretch, textureScale) {
                var texture = {
                    url: textureUrl,
                    stretch: textureStretch,
                    scale: textureScale
                };
                if (this.front) {
                    this.wall.frontTexture = texture;
                }
                else {
                    this.wall.backTexture = texture;
                }
                this.redrawCallbacks.fire();
            };
            HalfEdge.prototype.interiorDistance = function () {
                var start = this.interiorStart();
                var end = this.interiorEnd();
                return BP3D.Core.Utils.distance(start.x, start.y, end.x, end.y);
            };
            HalfEdge.prototype.computeTransforms = function (transform, invTransform, start, end) {
                var v1 = start;
                var v2 = end;
                var angle = BP3D.Core.Utils.angle(1, 0, v2.x - v1.x, v2.y - v1.y);
                var tt = new THREE.Matrix4();
                tt.makeTranslation(-v1.x, 0, -v1.y);
                var tr = new THREE.Matrix4();
                tr.makeRotationY(-angle);
                transform.multiplyMatrices(tr, tt);
                invTransform.getInverse(transform);
            };
            /** Gets the distance from specified point.
             * @param x X coordinate of the point.
             * @param y Y coordinate of the point.
             * @returns The distance.
             */
            HalfEdge.prototype.distanceTo = function (x, y) {
                // x, y, x1, y1, x2, y2
                return BP3D.Core.Utils.pointDistanceFromLine(x, y, this.interiorStart().x, this.interiorStart().y, this.interiorEnd().x, this.interiorEnd().y);
            };
            HalfEdge.prototype.getStart = function () {
                if (this.front) {
                    return this.wall.getStart();
                }
                else {
                    return this.wall.getEnd();
                }
            };
            HalfEdge.prototype.getEnd = function () {
                if (this.front) {
                    return this.wall.getEnd();
                }
                else {
                    return this.wall.getStart();
                }
            };
            HalfEdge.prototype.getOppositeEdge = function () {
                if (this.front) {
                    return this.wall.backEdge;
                }
                else {
                    return this.wall.frontEdge;
                }
            };
            // these return an object with attributes x, y
            HalfEdge.prototype.interiorEnd = function () {
                var vec = this.halfAngleVector(this, this.next);
                return {
                    x: this.getEnd().x + vec.x,
                    y: this.getEnd().y + vec.y
                };
            };
            HalfEdge.prototype.interiorStart = function () {
                var vec = this.halfAngleVector(this.prev, this);
                return {
                    x: this.getStart().x + vec.x,
                    y: this.getStart().y + vec.y
                };
            };
            HalfEdge.prototype.interiorCenter = function () {
                return {
                    x: (this.interiorStart().x + this.interiorEnd().x) / 2.0,
                    y: (this.interiorStart().y + this.interiorEnd().y) / 2.0,
                };
            };
            HalfEdge.prototype.exteriorEnd = function () {
                var vec = this.halfAngleVector(this, this.next);
                return {
                    x: this.getEnd().x - vec.x,
                    y: this.getEnd().y - vec.y
                };
            };
            HalfEdge.prototype.exteriorStart = function () {
                var vec = this.halfAngleVector(this.prev, this);
                return {
                    x: this.getStart().x - vec.x,
                    y: this.getStart().y - vec.y
                };
            };
            /** Get the corners of the half edge.
             * @returns An array of x,y pairs.
             */
            HalfEdge.prototype.corners = function () {
                return [this.interiorStart(), this.interiorEnd(),
                    this.exteriorEnd(), this.exteriorStart()];
            };
            /**
             * Gets CCW angle from v1 to v2
             */
            HalfEdge.prototype.halfAngleVector = function (v1, v2) {
                // make the best of things if we dont have prev or next
                if (!v1) {
                    var v1startX = v2.getStart().x - (v2.getEnd().x - v2.getStart().x);
                    var v1startY = v2.getStart().y - (v2.getEnd().y - v2.getStart().y);
                    var v1endX = v2.getStart().x;
                    var v1endY = v2.getStart().y;
                }
                else {
                    var v1startX = v1.getStart().x;
                    var v1startY = v1.getStart().y;
                    var v1endX = v1.getEnd().x;
                    var v1endY = v1.getEnd().y;
                }
                if (!v2) {
                    var v2startX = v1.getEnd().x;
                    var v2startY = v1.getEnd().y;
                    var v2endX = v1.getEnd().x + (v1.getEnd().x - v1.getStart().x);
                    var v2endY = v1.getEnd().y + (v1.getEnd().y - v1.getStart().y);
                }
                else {
                    var v2startX = v2.getStart().x;
                    var v2startY = v2.getStart().y;
                    var v2endX = v2.getEnd().x;
                    var v2endY = v2.getEnd().y;
                }
                // CCW angle between edges
                var theta = BP3D.Core.Utils.angle2pi(v1startX - v1endX, v1startY - v1endY, v2endX - v1endX, v2endY - v1endY);
                // cosine and sine of half angle
                var cs = Math.cos(theta / 2.0);
                var sn = Math.sin(theta / 2.0);
                // rotate v2
                var v2dx = v2endX - v2startX;
                var v2dy = v2endY - v2startY;
                var vx = v2dx * cs - v2dy * sn;
                var vy = v2dx * sn + v2dy * cs;
                // normalize
                var mag = BP3D.Core.Utils.distance(0, 0, vx, vy);
                var desiredMag = (this.offset) / sn;
                var scalar = desiredMag / mag;
                var halfAngleVector = {
                    x: vx * scalar,
                    y: vy * scalar
                };
                return halfAngleVector;
            };
            return HalfEdge;
        })();
        Model.HalfEdge = HalfEdge;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/configuration.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../items/item.ts" />
/// <reference path="corner.ts" />
/// <reference path="half_edge.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /** The default wall texture. */
        var defaultWallTexture = {
            url: "../../shared/rooms/textures/wallmap.png",
            stretch: true,
            scale: 0
        };
        /**
         * A Wall is the basic element to create Rooms.
         *
         * Walls consists of two half edges.
         */
        var Wall = (function () {
            /**
             * Constructs a new wall.
             * @param start Start corner.
             * @param end End corner.
             */
            function Wall(start, end, height) {
                if (height === void 0) { height = -1; }
                this.start = start;
                this.end = end;
                /** Front is the plane from start to end. */
                this.frontEdge = null;
                /** Back is the plane from end to start. */
                this.backEdge = null;
                /** */
                this.orphan = false;
                /** Items attached to this wall */
                this.items = [];
                /** */
                this.onItems = [];
                /** The front-side texture. */
                this.frontTexture = defaultWallTexture;
                /** The back-side texture. */
                this.backTexture = defaultWallTexture;
                /** Wall thickness. */
                this.thickness = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallThickness);
                /** Wall height. */
                this.height = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight);
                /** Actions to be applied after movement. */
                this.moved_callbacks = $.Callbacks();
                /** Actions to be applied on removal. */
                this.deleted_callbacks = $.Callbacks();
                /** Actions to be applied explicitly. */
                this.action_callbacks = $.Callbacks();
                this.id = this.getUuid();
                if (height > -1) {
                    this.height = height;
                }
                this.start.attachStart(this);
                this.end.attachEnd(this);
            }
            Wall.prototype.getUuid = function () {
                return [this.start.id, this.end.id].join();
            };
            Wall.prototype.resetFrontBack = function () {
                this.frontEdge = null;
                this.backEdge = null;
                this.orphan = false;
            };
            Wall.prototype.snapToAxis = function (tolerance) {
                // order here is important, but unfortunately arbitrary
                this.start.snapToAxis(tolerance);
                this.end.snapToAxis(tolerance);
            };
            Wall.prototype.fireOnMove = function (func) {
                this.moved_callbacks.add(func);
            };
            Wall.prototype.fireOnDelete = function (func) {
                this.deleted_callbacks.add(func);
            };
            Wall.prototype.dontFireOnDelete = function (func) {
                this.deleted_callbacks.remove(func);
            };
            Wall.prototype.fireOnAction = function (func) {
                this.action_callbacks.add(func);
            };
            Wall.prototype.fireAction = function (action) {
                this.action_callbacks.fire(action);
            };
            Wall.prototype.relativeMove = function (dx, dy) {
                this.start.relativeMove(dx, dy);
                this.end.relativeMove(dx, dy);
            };
            Wall.prototype.fireMoved = function () {
                this.moved_callbacks.fire();
            };
            Wall.prototype.fireRedraw = function () {
                if (this.frontEdge) {
                    this.frontEdge.redrawCallbacks.fire();
                }
                if (this.backEdge) {
                    this.backEdge.redrawCallbacks.fire();
                }
            };
            Wall.prototype.getStart = function () {
                return this.start;
            };
            Wall.prototype.getEnd = function () {
                return this.end;
            };
            Wall.prototype.getStartX = function () {
                return this.start.getX();
            };
            Wall.prototype.getEndX = function () {
                return this.end.getX();
            };
            Wall.prototype.getStartY = function () {
                return this.start.getY();
            };
            Wall.prototype.getEndY = function () {
                return this.end.getY();
            };
            Wall.prototype.remove = function () {
                this.start.detachWall(this);
                this.end.detachWall(this);
                this.deleted_callbacks.fire(this);
            };
            Wall.prototype.setStart = function (corner) {
                this.start.detachWall(this);
                corner.attachStart(this);
                this.start = corner;
                this.fireMoved();
            };
            Wall.prototype.setEnd = function (corner) {
                this.end.detachWall(this);
                corner.attachEnd(this);
                this.end = corner;
                this.fireMoved();
            };
            Wall.prototype.distanceFrom = function (x, y) {
                return BP3D.Core.Utils.pointDistanceFromLine(x, y, this.getStartX(), this.getStartY(), this.getEndX(), this.getEndY());
            };
            /** Return the corner opposite of the one provided.
             * @param corner The given corner.
             * @returns The opposite corner.
             */
            Wall.prototype.oppositeCorner = function (corner) {
                if (this.start === corner) {
                    return this.end;
                }
                else if (this.end === corner) {
                    return this.start;
                }
                else {
                    console.log('Wall does not connect to corner');
                }
            };
            return Wall;
        })();
        Model.Wall = Wall;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="corner.ts" />
/// <reference path="floorplan.ts" />
/// <reference path="half_edge.ts" />
/*
TODO
var Vec2 = require('vec2')
var segseg = require('segseg')
var Polygon = require('polygon')
*/
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /** Default texture to be used if nothing is provided. */
        var defaultRoomTexture = {
            url: "../../shared/rooms/textures/hardwood.png",
            scale: 400
        };
        /**
         * A Room is the combination of a Floorplan with a floor plane.
         */
        var Room = (function () {
            /**
             *  ordered CCW
             */
            function Room(floorplan, corners) {
                this.floorplan = floorplan;
                this.corners = corners;
                /** */
                this.interiorCorners = [];
                /** */
                this.edgePointer = null;
                /** floor plane for intersection testing */
                this.floorPlane = null;
                /** */
                this.customTexture = false;
                /** */
                this.floorChangeCallbacks = $.Callbacks();
                this.updateWalls();
                this.updateInteriorCorners();
                this.generatePlane();
            }
            Room.prototype.getUuid = function () {
                var cornerUuids = BP3D.Core.Utils.map(this.corners, function (c) {
                    return c.id;
                });
                cornerUuids.sort();
                return cornerUuids.join();
            };
            Room.prototype.fireOnFloorChange = function (callback) {
                this.floorChangeCallbacks.add(callback);
            };
            Room.prototype.getTexture = function () {
                var uuid = this.getUuid();
                var tex = this.floorplan.getFloorTexture(uuid);
                return tex || defaultRoomTexture;
            };
            /**
             * textureStretch always true, just an argument for consistency with walls
             */
            Room.prototype.setTexture = function (textureUrl, textureStretch, textureScale) {
                var uuid = this.getUuid();
                this.floorplan.setFloorTexture(uuid, textureUrl, textureScale);
                this.floorChangeCallbacks.fire();
            };
            Room.prototype.generatePlane = function () {
                var points = [];
                this.interiorCorners.forEach(function (corner) {
                    points.push(new THREE.Vector2(corner.x, corner.y));
                });
                var shape = new THREE.Shape(points);
                var geometry = new THREE.ShapeGeometry(shape);
                this.floorPlane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide
                }));
                this.floorPlane.visible = false;
                this.floorPlane.rotation.set(Math.PI / 2, 0, 0);
                this.floorPlane.room = this; // js monkey patch
            };
            Room.prototype.cycleIndex = function (index) {
                if (index < 0) {
                    return index += this.corners.length;
                }
                else {
                    return index % this.corners.length;
                }
            };
            Room.prototype.updateInteriorCorners = function () {
                var edge = this.edgePointer;
                while (true) {
                    this.interiorCorners.push(edge.interiorStart());
                    edge.generatePlane();
                    if (edge.next === this.edgePointer) {
                        break;
                    }
                    else {
                        edge = edge.next;
                    }
                }
            };
            /**
             * Populates each wall's half edge relating to this room
             * this creates a fancy doubly connected edge list (DCEL)
             */
            Room.prototype.updateWalls = function () {
                var prevEdge = null;
                var firstEdge = null;
                for (var i = 0; i < this.corners.length; i++) {
                    var firstCorner = this.corners[i];
                    var secondCorner = this.corners[(i + 1) % this.corners.length];
                    // find if wall is heading in that direction
                    var wallTo = firstCorner.wallTo(secondCorner);
                    var wallFrom = firstCorner.wallFrom(secondCorner);
                    if (wallTo) {
                        var edge = new Model.HalfEdge(this, wallTo, true);
                    }
                    else if (wallFrom) {
                        var edge = new Model.HalfEdge(this, wallFrom, false);
                    }
                    else {
                        // something horrible has happened
                        console.log("corners arent connected by a wall, uh oh");
                    }
                    if (i == 0) {
                        firstEdge = edge;
                    }
                    else {
                        edge.prev = prevEdge;
                        prevEdge.next = edge;
                        if (i + 1 == this.corners.length) {
                            firstEdge.prev = edge;
                            edge.next = firstEdge;
                        }
                    }
                    prevEdge = edge;
                }
                // hold on to an edge reference
                this.edgePointer = firstEdge;
            };
            return Room;
        })();
        Model.Room = Room;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../io/format.ts" />
/// <reference path="wall.ts" />
/// <reference path="corner.ts" />
/// <reference path="room.ts" />
/// <reference path="half_edge.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /** */
        var defaultFloorPlanTolerance = 10.0;
        /**
         * A Floorplan represents a number of Walls, Corners and Rooms.
         */
        var Floorplan = (function () {
            /** Constructs a floorplan. */
            function Floorplan() {
                /** */
                this.walls = [];
                /** */
                this.corners = [];
                /** */
                this.rooms = [];
                /** */
                this.new_wall_callbacks = $.Callbacks();
                /** */
                this.new_corner_callbacks = $.Callbacks();
                /** */
                this.redraw_callbacks = $.Callbacks();
                /** */
                this.updated_rooms = $.Callbacks();
                /** */
                this.roomLoadedCallbacks = $.Callbacks();
                /**
                * Floor textures are owned by the floorplan, because room objects are
                * destroyed and created each time we change the floorplan.
                * floorTextures is a map of room UUIDs (string) to a object with
                * url and scale attributes.
                */
                this.floorTextures = {};
            }
            // hack
            Floorplan.prototype.wallEdges = function () {
                var edges = [];
                this.walls.forEach(function (wall) {
                    if (wall.frontEdge) {
                        edges.push(wall.frontEdge);
                    }
                    if (wall.backEdge) {
                        edges.push(wall.backEdge);
                    }
                });
                return edges;
            };
            // hack
            Floorplan.prototype.wallEdgePlanes = function () {
                var planes = [];
                this.walls.forEach(function (wall) {
                    if (wall.frontEdge) {
                        planes.push(wall.frontEdge.plane);
                    }
                    if (wall.backEdge) {
                        planes.push(wall.backEdge.plane);
                    }
                });
                return planes;
            };
            Floorplan.prototype.floorPlanes = function () {
                return BP3D.Core.Utils.map(this.rooms, function (room) {
                    return room.floorPlane;
                });
            };
            Floorplan.prototype.fireOnNewWall = function (callback) {
                this.new_wall_callbacks.add(callback);
            };
            Floorplan.prototype.fireOnNewCorner = function (callback) {
                this.new_corner_callbacks.add(callback);
            };
            Floorplan.prototype.fireOnRedraw = function (callback) {
                this.redraw_callbacks.add(callback);
            };
            Floorplan.prototype.fireOnUpdatedRooms = function (callback) {
                this.updated_rooms.add(callback);
            };
            /**
             * Creates a new wall.
             * @param start The start corner.
             * @param end he end corner.
             * @returns The new wall.
             */
            Floorplan.prototype.newWall = function (start, end, height) {
                if (height === void 0) { height = -1; }
                var wall = new Model.Wall(start, end, height);
                this.walls.push(wall);
                var scope = this;
                wall.fireOnDelete(function () {
                    scope.removeWall(wall);
                });
                this.new_wall_callbacks.fire(wall);
                this.update();
                return wall;
            };
            /** Removes a wall.
             * @param wall The wall to be removed.
             */
            Floorplan.prototype.removeWall = function (wall) {
                BP3D.Core.Utils.removeValue(this.walls, wall);
                this.update();
            };
            /**
             * Creates a new corner.
             * @param x The x coordinate.
             * @param y The y coordinate.
             * @param id An optional id. If unspecified, the id will be created internally.
             * @returns The new corner.
             */
            Floorplan.prototype.newCorner = function (x, y, id) {
                var corner = new Model.Corner(this, x, y, id);
                this.corners.push(corner);
                var scope = this;
                corner.fireOnDelete(function () {
                    scope.removeCorner(corner);
                });
                this.new_corner_callbacks.fire(corner);
                this.update();
                return corner;
            };
            /** Removes a corner.
             * @param corner The corner to be removed.
             */
            Floorplan.prototype.removeCorner = function (corner) {
                BP3D.Core.Utils.removeValue(this.corners, corner);
            };
            /** Gets the walls. */
            Floorplan.prototype.getWalls = function () {
                return this.walls;
            };
            /** Gets the corners. */
            Floorplan.prototype.getCorners = function () {
                return this.corners;
            };
            /** Gets the rooms. */
            Floorplan.prototype.getRooms = function () {
                return this.rooms;
            };
            Floorplan.prototype.overlappedCorner = function (x, y, tolerance) {
                tolerance = tolerance || defaultFloorPlanTolerance;
                for (var i = 0; i < this.corners.length; i++) {
                    if (this.corners[i].distanceFrom(x, y) < tolerance) {
                        return this.corners[i];
                    }
                }
                return null;
            };
            Floorplan.prototype.overlappedWall = function (x, y, tolerance) {
                tolerance = tolerance || defaultFloorPlanTolerance;
                for (var i = 0; i < this.walls.length; i++) {
                    if (this.walls[i].distanceFrom(x, y) < tolerance) {
                        return this.walls[i];
                    }
                }
                return null;
            };
            // import and export -- cleanup
            Floorplan.prototype.saveFloorplan = function () {
                var floorplan = {
                    corners: {},
                    walls: [],
                    wallTextures: [],
                    floorTextures: [],
                    newFloorTextures: {}
                };
                this.corners.forEach(function (corner) {
                    floorplan.corners[corner.id] = {
                        'x': corner.x,
                        'y': corner.y
                    };
                });
                this.walls.forEach(function (wall) {
                    floorplan.walls.push({
                        'corner1': wall.getStart().id,
                        'corner2': wall.getEnd().id,
                        'frontTexture': wall.frontTexture,
                        'backTexture': wall.backTexture
                    });
                });
                floorplan.newFloorTextures = this.floorTextures;
                return floorplan;
            };
            Floorplan.prototype.loadFloorplan = function (floorplan) {
                var _this = this;
                this.reset();
                var tThick = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallThickness);
                BP3D.Core.Configuration.setValue(BP3D.Core.configWallThickness, tThick * BP3D.Three.CmToWorld);
                var corners = {};
                if (floorplan == null || !('corners' in floorplan) || !('walls' in floorplan)) {
                    return;
                }
                for (var id in floorplan.corners) {
                    var corner = floorplan.corners[id];
                    corners[id] = this.newCorner(corner.x * BP3D.Three.CmToWorld, corner.y * BP3D.Three.CmToWorld, id);
                }
                var scope = this;
                floorplan.walls.forEach(function (wall) {
                    var tWallHeight = -1;
                    if (wall.height) {
                        tWallHeight = wall.height * BP3D.Three.CmToWorld;
                    }
                    else {
                        tWallHeight = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight) * BP3D.Three.CmToWorld;
                    }
                    var newWall = scope.newWall(corners[wall.corner1], corners[wall.corner2], tWallHeight);
                    if (wall.frontTexture) {
                        newWall.frontTexture = {
                            url: wall.frontTexture.url,
                            scale: wall.frontTexture.scale * BP3D.Three.CmToWorld,
                            stretch: wall.frontTexture.stretch
                        };
                    }
                    if (wall.backTexture) {
                        newWall.backTexture = {
                            url: wall.backTexture.url,
                            scale: wall.backTexture.scale * BP3D.Three.CmToWorld,
                            stretch: wall.backTexture.stretch
                        };
                    }
                });
                if ('newFloorTextures' in floorplan) {
                    this.floorTextures = floorplan.newFloorTextures;
                    Object.keys(this.floorTextures).forEach(function (k) {
                        var t = _this.floorTextures[k];
                        t.scale *= BP3D.Three.CmToWorld;
                    });
                }
                this.update();
                this.roomLoadedCallbacks.fire();
            };
            Floorplan.prototype.getFloorTexture = function (uuid) {
                if (uuid in this.floorTextures) {
                    return this.floorTextures[uuid];
                }
                else {
                    return null;
                }
            };
            Floorplan.prototype.setFloorTexture = function (uuid, url, scale) {
                this.floorTextures[uuid] = {
                    url: url,
                    scale: scale
                };
            };
            /** clear out obsolete floor textures */
            Floorplan.prototype.updateFloorTextures = function () {
                var uuids = BP3D.Core.Utils.map(this.rooms, function (room) {
                    return room.getUuid();
                });
                for (var uuid in this.floorTextures) {
                    if (!BP3D.Core.Utils.hasValue(uuids, uuid)) {
                        delete this.floorTextures[uuid];
                    }
                }
            };
            /** */
            Floorplan.prototype.reset = function () {
                var tmpCorners = this.corners.slice(0);
                var tmpWalls = this.walls.slice(0);
                tmpCorners.forEach(function (corner) {
                    corner.remove();
                });
                tmpWalls.forEach(function (wall) {
                    wall.remove();
                });
                this.corners = [];
                this.walls = [];
            };
            /**
             * Update rooms
             */
            Floorplan.prototype.update = function () {
                this.walls.forEach(function (wall) {
                    wall.resetFrontBack();
                });
                var roomCorners = this.findRooms(this.corners);
                this.rooms = [];
                var scope = this;
                roomCorners.forEach(function (corners) {
                    scope.rooms.push(new Model.Room(scope, corners));
                });
                this.assignOrphanEdges();
                this.updateFloorTextures();
                this.updated_rooms.fire();
            };
            /**
             * Returns the center of the floorplan in the y plane
             */
            Floorplan.prototype.getCenter = function () {
                return this.getDimensions(true);
            };
            Floorplan.prototype.getSize = function () {
                return this.getDimensions(false);
            };
            Floorplan.prototype.getDimensions = function (center) {
                center = center || false; // otherwise, get size
                var xMin = Infinity;
                var xMax = -Infinity;
                var zMin = Infinity;
                var zMax = -Infinity;
                this.corners.forEach(function (corner) {
                    if (corner.x < xMin)
                        xMin = corner.x;
                    if (corner.x > xMax)
                        xMax = corner.x;
                    if (corner.y < zMin)
                        zMin = corner.y;
                    if (corner.y > zMax)
                        zMax = corner.y;
                });
                var ret;
                if (xMin == Infinity || xMax == -Infinity || zMin == Infinity || zMax == -Infinity) {
                    ret = new THREE.Vector3();
                }
                else {
                    if (center) {
                        // center
                        ret = new THREE.Vector3((xMin + xMax) * 0.5, 0, (zMin + zMax) * 0.5);
                    }
                    else {
                        // size
                        ret = new THREE.Vector3((xMax - xMin), 0, (zMax - zMin));
                    }
                }
                return ret;
            };
            Floorplan.prototype.assignOrphanEdges = function () {
                // kinda hacky
                // find orphaned wall segments (i.e. not part of rooms) and
                // give them edges
                var orphanWalls = [];
                this.walls.forEach(function (wall) {
                    if (!wall.backEdge && !wall.frontEdge) {
                        wall.orphan = true;
                        var back = new Model.HalfEdge(null, wall, false);
                        back.generatePlane();
                        var front = new Model.HalfEdge(null, wall, true);
                        front.generatePlane();
                        orphanWalls.push(wall);
                    }
                });
            };
            /*
             * Find the "rooms" in our planar straight-line graph.
             * Rooms are set of the smallest (by area) possible cycles in this graph.
             * @param corners The corners of the floorplan.
             * @returns The rooms, each room as an array of corners.
             */
            Floorplan.prototype.findRooms = function (corners) {
                function _calculateTheta(previousCorner, currentCorner, nextCorner) {
                    var theta = BP3D.Core.Utils.angle2pi(previousCorner.x - currentCorner.x, previousCorner.y - currentCorner.y, nextCorner.x - currentCorner.x, nextCorner.y - currentCorner.y);
                    return theta;
                }
                function _removeDuplicateRooms(roomArray) {
                    var results = [];
                    var lookup = {};
                    var hashFunc = function (corner) {
                        return corner.id;
                    };
                    var sep = '-';
                    for (var i = 0; i < roomArray.length; i++) {
                        // rooms are cycles, shift it around to check uniqueness
                        var add = true;
                        var room = roomArray[i];
                        for (var j = 0; j < room.length; j++) {
                            var roomShift = BP3D.Core.Utils.cycle(room, j);
                            var str = BP3D.Core.Utils.map(roomShift, hashFunc).join(sep);
                            if (lookup.hasOwnProperty(str)) {
                                add = false;
                            }
                        }
                        if (add) {
                            results.push(roomArray[i]);
                            lookup[str] = true;
                        }
                    }
                    return results;
                }
                function _findTightestCycle(firstCorner, secondCorner) {
                    var stack = [];
                    var next = {
                        corner: secondCorner,
                        previousCorners: [firstCorner]
                    };
                    var visited = {};
                    visited[firstCorner.id] = true;
                    while (next) {
                        // update previous corners, current corner, and visited corners
                        var currentCorner = next.corner;
                        visited[currentCorner.id] = true;
                        // did we make it back to the startCorner?
                        if (next.corner === firstCorner && currentCorner !== secondCorner) {
                            return next.previousCorners;
                        }
                        var addToStack = [];
                        var adjacentCorners = next.corner.adjacentCorners();
                        for (var i = 0; i < adjacentCorners.length; i++) {
                            var nextCorner = adjacentCorners[i];
                            // is this where we came from?
                            // give an exception if its the first corner and we aren't at the second corner
                            if (nextCorner.id in visited &&
                                !(nextCorner === firstCorner && currentCorner !== secondCorner)) {
                                continue;
                            }
                            // nope, throw it on the queue  
                            addToStack.push(nextCorner);
                        }
                        var previousCorners = next.previousCorners.slice(0);
                        previousCorners.push(currentCorner);
                        if (addToStack.length > 1) {
                            // visit the ones with smallest theta first
                            var previousCorner = next.previousCorners[next.previousCorners.length - 1];
                            addToStack.sort(function (a, b) {
                                return (_calculateTheta(previousCorner, currentCorner, b) -
                                    _calculateTheta(previousCorner, currentCorner, a));
                            });
                        }
                        if (addToStack.length > 0) {
                            // add to the stack
                            addToStack.forEach(function (corner) {
                                stack.push({
                                    corner: corner,
                                    previousCorners: previousCorners
                                });
                            });
                        }
                        // pop off the next one
                        next = stack.pop();
                    }
                    return [];
                }
                // find tightest loops, for each corner, for each adjacent
                // TODO: optimize this, only check corners with > 2 adjacents, or isolated cycles
                var loops = [];
                corners.forEach(function (firstCorner) {
                    firstCorner.adjacentCorners().forEach(function (secondCorner) {
                        loops.push(_findTightestCycle(firstCorner, secondCorner));
                    });
                });
                // remove duplicates
                var uniqueLoops = _removeDuplicateRooms(loops);
                //remove CW loops
                var uniqueCCWLoops = BP3D.Core.Utils.removeIf(uniqueLoops, BP3D.Core.Utils.isClockwise);
                return uniqueCCWLoops;
            };
            return Floorplan;
        })();
        Model.Floorplan = Floorplan;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /**
         * A Floor Item is an entity to be placed related to a floor.
         */
        var FloorItem = (function (_super) {
            __extends(FloorItem, _super);
            function FloorItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
            }
            ;
            /** */
            FloorItem.prototype.placeInRoom = function () {
                if (!this.position_set) {
                    var center = this.model.floorplan.getCenter();
                    this.position.x = center.x;
                    this.position.z = center.z;
                    this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y);
                }
            };
            ;
            /** Take action after a resize */
            FloorItem.prototype.resized = function () {
                this.position.y = this.halfSize.y;
            };
            /** */
            FloorItem.prototype.moveToPosition = function (vec3, intersection) {
                // keeps the position in the room and on the floor
                if (!this.isValidPosition(vec3)) {
                    this.showError(vec3);
                    return;
                }
                else {
                    this.hideError();
                    vec3.y = this.position.y; // keep it on the floor!
                    this.position.copy(vec3);
                }
            };
            /** */
            FloorItem.prototype.isValidPosition = function (vec3) {
                var corners = this.getCorners('x', 'z', vec3);
                // check if we are in a room
                var rooms = this.model.floorplan.getRooms();
                var isInARoom = false;
                for (var i = 0; i < rooms.length; i++) {
                    if (BP3D.Core.Utils.pointInPolygon(vec3.x, vec3.z, rooms[i].interiorCorners) &&
                        !BP3D.Core.Utils.polygonPolygonIntersect(corners, rooms[i].interiorCorners)) {
                        isInARoom = true;
                    }
                }
                if (!isInARoom) {
                    //console.log('object not in a room');
                    return false;
                }
                // check if we are outside all other objects
                /*
                if (this.obstructFloorMoves) {
                    var objects = this.model.items.getItems();
                    for (var i = 0; i < objects.length; i++) {
                        if (objects[i] === this || !objects[i].obstructFloorMoves) {
                            continue;
                        }
                        if (!utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z')) ||
                            utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
                            //console.log('object not outside other objects');
                            return false;
                        }
                    }
                }*/
                return true;
            };
            return FloorItem;
        })(Items.Item);
        Items.FloorItem = FloorItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../model/half_edge.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /**
         * A Wall Item is an entity to be placed related to a wall.
         */
        var WallItem = (function (_super) {
            __extends(WallItem, _super);
            function WallItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
                /** The currently applied wall edge. */
                this.currentWallEdge = null;
                /* TODO:
                   This caused a huge headache.
                   HalfEdges get destroyed/created every time floorplan is edited.
                   This item should store a reference to a wall and front/back,
                   and grab its edge reference dynamically whenever it needs it.
                 */
                /** used for finding rotations */
                this.refVec = new THREE.Vector2(0, 1.0);
                /** */
                this.wallOffsetScalar = 0;
                /** */
                this.sizeX = 0;
                /** */
                this.sizeY = 0;
                /** */
                this.addToWall = false;
                /** */
                this.boundToFloor = false;
                /** */
                this.frontVisible = false;
                /** */
                this.backVisible = false;
                this.allowRotate = false;
            }
            ;
            /** Get the closet wall edge.
             * @returns The wall edge.
             */
            WallItem.prototype.closestWallEdge = function () {
                var wallEdges = this.model.floorplan.wallEdges();
                var wallEdge = null;
                var minDistance = null;
                var itemX = this.position.x;
                var itemZ = this.position.z;
                wallEdges.forEach(function (edge) {
                    var distance = edge.distanceTo(itemX, itemZ);
                    if (minDistance === null || distance < minDistance) {
                        minDistance = distance;
                        wallEdge = edge;
                    }
                });
                return wallEdge;
            };
            /** */
            WallItem.prototype.removed = function () {
                if (this.currentWallEdge != null && this.addToWall) {
                    BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
                    this.redrawWall();
                }
            };
            /** */
            WallItem.prototype.redrawWall = function () {
                if (this.addToWall) {
                    this.currentWallEdge.wall.fireRedraw();
                }
            };
            /** */
            WallItem.prototype.updateEdgeVisibility = function (visible, front) {
                if (front) {
                    this.frontVisible = visible;
                }
                else {
                    this.backVisible = visible;
                }
                this.visible = (this.frontVisible || this.backVisible);
            };
            /** */
            WallItem.prototype.updateSize = function () {
                this.wallOffsetScalar = (this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z) * this.scale.z / 2.0;
                this.sizeX = (this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x) * this.scale.x;
                this.sizeY = (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y;
            };
            /** */
            WallItem.prototype.resized = function () {
                if (this.boundToFloor) {
                    this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
                }
                this.updateSize();
                this.redrawWall();
            };
            /** */
            WallItem.prototype.placeInRoom = function () {
                var closestWallEdge = this.closestWallEdge();
                this.changeWallEdge(closestWallEdge);
                this.updateSize();
                if (!this.position_set) {
                    // position not set
                    var center = closestWallEdge.interiorCenter();
                    var newPos = new THREE.Vector3(center.x, closestWallEdge.wall.height / 2.0, center.y);
                    this.boundMove(newPos);
                    this.position.copy(newPos);
                    this.redrawWall();
                }
            };
            ;
            /** */
            WallItem.prototype.moveToPosition = function (vec3, intersection) {
                this.changeWallEdge(intersection.object.edge);
                this.boundMove(vec3);
                this.position.copy(vec3);
                this.redrawWall();
            };
            /** */
            WallItem.prototype.getWallOffset = function () {
                return this.wallOffsetScalar;
            };
            /** */
            WallItem.prototype.changeWallEdge = function (wallEdge) {
                if (this.currentWallEdge != null) {
                    if (this.addToWall) {
                        BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
                        this.redrawWall();
                    }
                    else {
                        BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.onItems, this);
                    }
                }
                // handle subscription to wall being removed
                if (this.currentWallEdge != null) {
                    this.currentWallEdge.wall.dontFireOnDelete(this.remove.bind(this));
                }
                wallEdge.wall.fireOnDelete(this.remove.bind(this));
                // find angle between wall normals
                var normal2 = new THREE.Vector2();
                var normal3 = wallEdge.plane.geometry.faces[0].normal;
                normal2.x = normal3.x;
                normal2.y = normal3.z;
                var angle = BP3D.Core.Utils.angle(this.refVec.x, this.refVec.y, normal2.x, normal2.y);
                this.rotation.y = angle;
                // update currentWall
                this.currentWallEdge = wallEdge;
                if (this.addToWall) {
                    wallEdge.wall.items.push(this);
                    this.redrawWall();
                }
                else {
                    wallEdge.wall.onItems.push(this);
                }
            };
            /** Returns an array of planes to use other than the ground plane
             * for passing intersection to clickPressed and clickDragged */
            WallItem.prototype.customIntersectionPlanes = function () {
                return this.model.floorplan.wallEdgePlanes();
            };
            /** takes the move vec3, and makes sure object stays bounded on plane */
            WallItem.prototype.boundMove = function (vec3) {
                var tolerance = 1;
                var edge = this.currentWallEdge;
                vec3.applyMatrix4(edge.interiorTransform);
                if (vec3.x < this.sizeX / 2.0 + tolerance) {
                    vec3.x = this.sizeX / 2.0 + tolerance;
                }
                else if (vec3.x > (edge.interiorDistance() - this.sizeX / 2.0 - tolerance)) {
                    vec3.x = edge.interiorDistance() - this.sizeX / 2.0 - tolerance;
                }
                if (this.boundToFloor) {
                    vec3.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
                }
                else {
                    if (vec3.y < this.sizeY / 2.0 + tolerance) {
                        vec3.y = this.sizeY / 2.0 + tolerance;
                    }
                    else if (vec3.y > edge.height - this.sizeY / 2.0 - tolerance) {
                        vec3.y = edge.height - this.sizeY / 2.0 - tolerance;
                    }
                }
                vec3.z = this.getWallOffset();
                vec3.applyMatrix4(edge.invInteriorTransform);
            };
            return WallItem;
        })(Items.Item);
        Items.WallItem = WallItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="wall_item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /** */
        var InWallItem = (function (_super) {
            __extends(InWallItem, _super);
            function InWallItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
                this.addToWall = true;
            }
            ;
            /** */
            InWallItem.prototype.getWallOffset = function () {
                // fudge factor so it saves to the right wall
                return -this.currentWallEdge.offset + 0.5;
            };
            return InWallItem;
        })(Items.WallItem);
        Items.InWallItem = InWallItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="in_wall_item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /** */
        var InWallFloorItem = (function (_super) {
            __extends(InWallFloorItem, _super);
            function InWallFloorItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
                this.boundToFloor = true;
            }
            ;
            return InWallFloorItem;
        })(Items.InWallItem);
        Items.InWallFloorItem = InWallFloorItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="floor_item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /** */
        var OnFloorItem = (function (_super) {
            __extends(OnFloorItem, _super);
            function OnFloorItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
                this.obstructFloorMoves = false;
                this.receiveShadow = true;
            }
            ;
            return OnFloorItem;
        })(Items.FloorItem);
        Items.OnFloorItem = OnFloorItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="wall_item.ts" />
/// <reference path="metadata.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /** */
        var WallFloorItem = (function (_super) {
            __extends(WallFloorItem, _super);
            function WallFloorItem(model, metadata, geometry, material, position, rotation, scale) {
                _super.call(this, model, metadata, geometry, material, position, rotation, scale);
                this.boundToFloor = true;
            }
            ;
            return WallFloorItem;
        })(Items.WallItem);
        Items.WallFloorItem = WallFloorItem;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="floor_item.ts" />
/// <reference path="in_wall_floor_item.ts" />
/// <reference path="in_wall_item.ts" />
/// <reference path="on_floor_item.ts" />
/// <reference path="wall_floor_item.ts" />
/// <reference path="wall_item.ts" />
var BP3D;
(function (BP3D) {
    var Items;
    (function (Items) {
        /** Enumeration of item types. */
        var item_types = {
            1: Items.FloorItem,
            2: Items.WallItem,
            3: Items.InWallItem,
            7: Items.InWallFloorItem,
            8: Items.OnFloorItem,
            9: Items.WallFloorItem
        };
        /** Factory class to create items. */
        var Factory = (function () {
            function Factory() {
            }
            /** Gets the class for the specified item. */
            Factory.getClass = function (itemType) {
                return item_types[itemType];
            };
            return Factory;
        })();
        Items.Factory = Factory;
    })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../items/factory.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model) {
        /**
         * The Scene is a manager of Items and also links to a ThreeJS scene.
         */
        var Scene = (function () {
            /**
             * Constructs a scene.
             * @param model The associated model.
             * @param textureDir The directory from which to load the textures.
             */
            function Scene(model, textureDir) {
                this.model = model;
                this.textureDir = textureDir;
                /** */
                this.items = [];
                /** */
                this.needsUpdate = false;
                /** */
                this.itemLoadingCallbacks = $.Callbacks();
                /** Item */
                this.itemLoadedCallbacks = $.Callbacks();
                /** Item */
                this.itemRemovedCallbacks = $.Callbacks();
                this.scene = new THREE.Scene();
                // init item loader
                this.loader = new THREE.JSONLoader();
                this.loader.crossOrigin = "";
            }
            /** Adds a non-item, basically a mesh, to the scene.
             * @param mesh The mesh to be added.
             */
            Scene.prototype.add = function (mesh) {
                this.scene.add(mesh);
            };
            /** Removes a non-item, basically a mesh, from the scene.
             * @param mesh The mesh to be removed.
             */
            Scene.prototype.remove = function (mesh) {
                this.scene.remove(mesh);
                BP3D.Core.Utils.removeValue(this.items, mesh);
            };
            /** Gets the scene.
             * @returns The scene.
             */
            Scene.prototype.getScene = function () {
                return this.scene;
            };
            /** Gets the items.
             * @returns The items.
             */
            Scene.prototype.getItems = function () {
                return this.items;
            };
            /** Gets the count of items.
             * @returns The count.
             */
            Scene.prototype.itemCount = function () {
                return this.items.length;
            };
            /** Removes all items. */
            Scene.prototype.clearItems = function () {
                var items_copy = this.items;
                var scope = this;
                this.items.forEach(function (item) {
                    scope.removeItem(item, true);
                });
                this.items = [];
            };
            /**
             * Removes an item.
             * @param item The item to be removed.
             * @param dontRemove If not set, also remove the item from the items list.
             */
            Scene.prototype.removeItem = function (item, dontRemove) {
                dontRemove = dontRemove || false;
                // use this for item meshes
                this.itemRemovedCallbacks.fire(item);
                item.removed();
                this.scene.remove(item);
                if (!dontRemove) {
                    BP3D.Core.Utils.removeValue(this.items, item);
                }
            };
            /**
             * Creates an item and adds it to the scene.
             * @param itemType The type of the item given by an enumerator.
             * @param fileName The name of the file to load.
             * @param metadata TODO
             * @param position The initial position.
             * @param rotation The initial rotation around the y axis.
             * @param scale The initial scaling.
             * @param fixed True if fixed.
             */
            Scene.prototype.addItem = function (itemType, fileName, metadata, position, rotation, scale, fixed) {
                itemType = itemType || 1;
                var scope = this;
                var loaderCallback = function (geometry, materials) {
                    var item = new (BP3D.Items.Factory.getClass(itemType))(scope.model, metadata, geometry, new THREE.MeshFaceMaterial(materials), position, rotation, scale);
                    item.fixed = fixed || false;
                    scope.items.push(item);
                    scope.add(item);
                    item.initObject();
                    scope.itemLoadedCallbacks.fire(item);
                };
                this.itemLoadingCallbacks.fire();
                this.loader.load(fileName, loaderCallback, undefined // TODO_Ekki 
                );
            };
            return Scene;
        })();
        Model.Scene = Scene;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../io/format.ts" />
/// <reference path="floorplan.ts" />
/// <reference path="scene.ts" />
var BP3D;
(function (BP3D) {
    var Model;
    (function (Model_1) {
        /**
         * A Model connects a Floorplan and a Scene.
         */
        var Model = (function () {
            /** Constructs a new model.
             * @param textureDir The directory containing the textures.
             */
            function Model(textureDir) {
                /** */
                this.roomLoadingCallbacks = $.Callbacks();
                /** */
                this.roomLoadedCallbacks = $.Callbacks();
                /** name */
                this.roomSavedCallbacks = $.Callbacks();
                /** success (bool), copy (bool) */
                this.roomDeletedCallbacks = $.Callbacks();
                this.floorplan = new Model_1.Floorplan();
                this.scene = new Model_1.Scene(this, textureDir);
            }
            Model.prototype.loadSerialized = function (json) {
                // TODO: better documentation on serialization format.
                // TODO: a much better serialization format.
                this.roomLoadingCallbacks.fire();
                var data = JSON.parse(json);
                this.newRoom(data.floorplan, data.items);
                this.roomLoadedCallbacks.fire();
            };
            //create .blueprint3d file
            Model.prototype.exportSerialized = function () {
                var items_arr = [];
                var objects = this.scene.getItems();
                for (var i = 0; i < objects.length; i++) {
                    var object = objects[i];
                    items_arr[i] = {
                        item_name: object.metadata.itemName,
                        item_type: object.metadata.itemType,
                        model_url: object.metadata.modelUrl,
                        xpos: object.position.x,
                        ypos: object.position.y,
                        zpos: object.position.z,
                        rotation: object.rotation.y,
                        scale_x: object.scale.x,
                        scale_y: object.scale.y,
                        scale_z: object.scale.z,
                        fixed: object.fixed
                    };
                }
                var room = {
                    floorplan: (this.floorplan.saveFloorplan()),
                    items: items_arr
                };
                return JSON.stringify(room);
            };
            Model.prototype.newRoom = function (floorplan, items) {
                var _this = this;
                this.scene.clearItems();
                this.floorplan.loadFloorplan(floorplan);
                items.forEach(function (item) {
                    var position = new THREE.Vector3(item.xpos, item.ypos, item.zpos);
                    var metadata = {
                        itemName: item.item_name,
                        resizable: (item.resizable != undefined ? item.resizable : true),
                        itemType: item.item_type,
                        modelUrl: item.model_url
                    };
                    var scale = new THREE.Vector3(item.scale_x, item.scale_y, item.scale_z);
                    _this.scene.addItem(item.item_type, item.model_url, metadata, position, item.rotation, scale, item.fixed);
                });
            };
            return Model;
        })();
        Model_1.Model = Model;
    })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/configuration.ts" />
/// <reference path="../core/dimensioning.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../model/floorplan.ts" />
/// <reference path="../model/half_edge.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="../model/wall.ts" />
/// <reference path="floorplanner.ts" />
var BP3D;
(function (BP3D) {
    var Floorplanner;
    (function (Floorplanner) {
        /** */
        Floorplanner.floorplannerModes = {
            MOVE: 0,
            DRAW: 1,
            DELETE: 2
        };
        /**
         * The View to be used by a Floorplanner to render in/interact with.
         */
        var FloorplannerView = (function () {
            /** */
            function FloorplannerView(floorplan, viewmodel, canvas) {
                this.floorplan = floorplan;
                this.viewmodel = viewmodel;
                this.canvas = canvas;
                this.canvasElement = document.getElementById(canvas);
                this.context = this.canvasElement.getContext('2d');
                var scope = this;
                $(window).resize(function () {
                    scope.handleWindowResize();
                });
                this.handleWindowResize();
            }
            /** */
            FloorplannerView.prototype.handleWindowResize = function () {
                var canvasSel = $("#" + this.canvas);
                var parent = canvasSel.parent();
                canvasSel.height(parent.innerHeight());
                canvasSel.width(parent.innerWidth());
                this.canvasElement.height = parent.innerHeight();
                this.canvasElement.width = parent.innerWidth();
                this.draw();
            };
            /** */
            FloorplannerView.prototype.draw = function () {
                var _this = this;
                this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                this.drawGrid();
                this.floorplan.getRooms().forEach(function (room) {
                    _this.drawRoom(room);
                });
                this.floorplan.getWalls().forEach(function (wall) {
                    _this.drawWall(wall);
                });
                this.floorplan.getCorners().forEach(function (corner) {
                    _this.drawCorner(corner);
                });
                if (this.viewmodel.mode == Floorplanner.floorplannerModes.DRAW) {
                    this.drawTarget(this.viewmodel.targetX, this.viewmodel.targetY, this.viewmodel.lastNode);
                }
                this.floorplan.getWalls().forEach(function (wall) {
                    _this.drawWallLabels(wall);
                });
            };
            /** */
            FloorplannerView.prototype.drawWallLabels = function (wall) {
                // we'll just draw the shorter label... idk
                if (wall.backEdge && wall.frontEdge) {
                    if (wall.backEdge.interiorDistance < wall.frontEdge.interiorDistance) {
                        this.drawEdgeLabel(wall.backEdge);
                    }
                    else {
                        this.drawEdgeLabel(wall.frontEdge);
                    }
                }
                else if (wall.backEdge) {
                    this.drawEdgeLabel(wall.backEdge);
                }
                else if (wall.frontEdge) {
                    this.drawEdgeLabel(wall.frontEdge);
                }
            };
            /** */
            FloorplannerView.prototype.drawWall = function (wall) {
                var wallWidth = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallWidth);
                var wallWidthHover = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallWidthHover);
                var deleteColor = BP3D.Core.Configuration.getStringValue(BP3D.Core.configDeleteColor);
                var hover = (wall === this.viewmodel.activeWall);
                var color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configWallColor);
                if (hover && this.viewmodel.mode == Floorplanner.floorplannerModes.DELETE) {
                    color = deleteColor;
                }
                else if (hover) {
                    color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configWallColorHover);
                }
                this.drawLine(this.viewmodel.convertX(wall.getStartX()), this.viewmodel.convertY(wall.getStartY()), this.viewmodel.convertX(wall.getEndX()), this.viewmodel.convertY(wall.getEndY()), hover ? wallWidthHover : wallWidth, color);
                if (!hover && wall.frontEdge) {
                    this.drawEdge(wall.frontEdge, hover);
                }
                if (!hover && wall.backEdge) {
                    this.drawEdge(wall.backEdge, hover);
                }
            };
            /** */
            FloorplannerView.prototype.drawEdgeLabel = function (edge) {
                var pos = edge.interiorCenter();
                var length = edge.interiorDistance();
                if (length < 60) {
                    // dont draw labels on walls this short
                    return;
                }
                this.context.font = "normal 12px Arial";
                this.context.fillStyle = "#000000";
                this.context.textBaseline = "middle";
                this.context.textAlign = "center";
                this.context.strokeStyle = "#ffffff";
                this.context.lineWidth = 4;
                this.context.strokeText(BP3D.Core.Dimensioning.cmToMeasure(length), this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
                this.context.fillText(BP3D.Core.Dimensioning.cmToMeasure(length), this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
            };
            /** */
            FloorplannerView.prototype.drawEdge = function (edge, hover) {
                var color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configEdgeColor);
                if (hover && this.viewmodel.mode == Floorplanner.floorplannerModes.DELETE) {
                    color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configDeleteColor);
                }
                else if (hover) {
                    color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configEdgeColorHover);
                }
                var corners = edge.corners();
                var scope = this;
                this.drawPolygon(BP3D.Core.Utils.map(corners, function (corner) {
                    return scope.viewmodel.convertX(corner.x);
                }), BP3D.Core.Utils.map(corners, function (corner) {
                    return scope.viewmodel.convertY(corner.y);
                }), false, null, true, color, BP3D.Core.Configuration.getNumericValue(BP3D.Core.configEdgeWidth));
            };
            /** */
            FloorplannerView.prototype.drawRoom = function (room) {
                var scope = this;
                this.drawPolygon(BP3D.Core.Utils.map(room.corners, function (corner) {
                    return scope.viewmodel.convertX(corner.x);
                }), BP3D.Core.Utils.map(room.corners, function (corner) {
                    return scope.viewmodel.convertY(corner.y);
                }), true, BP3D.Core.Configuration.getStringValue(BP3D.Core.configRoomColor));
            };
            /** */
            FloorplannerView.prototype.drawCorner = function (corner) {
                var hover = (corner === this.viewmodel.activeCorner);
                var color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configCornerColor);
                if (hover && this.viewmodel.mode == Floorplanner.floorplannerModes.DELETE) {
                    color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configDeleteColor);
                }
                else if (hover) {
                    color = BP3D.Core.Configuration.getStringValue(BP3D.Core.configCornerColorHover);
                }
                this.drawCircle(this.viewmodel.convertX(corner.x), this.viewmodel.convertY(corner.y), BP3D.Core.Configuration.getNumericValue(hover ? BP3D.Core.configCornerRadiusHover : BP3D.Core.configCornerRadius), color);
            };
            /** */
            FloorplannerView.prototype.drawTarget = function (x, y, lastNode) {
                this.drawCircle(this.viewmodel.convertX(x), this.viewmodel.convertY(y), BP3D.Core.Configuration.getNumericValue(BP3D.Core.configCornerRadiusHover), BP3D.Core.Configuration.getStringValue(BP3D.Core.configCornerColorHover));
                if (this.viewmodel.lastNode) {
                    this.drawLine(this.viewmodel.convertX(lastNode.x), this.viewmodel.convertY(lastNode.y), this.viewmodel.convertX(x), this.viewmodel.convertY(y), BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallWidthHover), BP3D.Core.Configuration.getStringValue(BP3D.Core.configWallColorHover));
                }
            };
            /** */
            FloorplannerView.prototype.drawLine = function (startX, startY, endX, endY, width, color) {
                // width is an integer
                // color is a hex string, i.e. #ff0000
                this.context.beginPath();
                this.context.moveTo(startX, startY);
                this.context.lineTo(endX, endY);
                this.context.lineWidth = width;
                this.context.strokeStyle = color;
                this.context.stroke();
            };
            /** */
            FloorplannerView.prototype.drawPolygon = function (xArr, yArr, fill, fillColor, stroke, strokeColor, strokeWidth) {
                // fillColor is a hex string, i.e. #ff0000
                fill = fill || false;
                stroke = stroke || false;
                this.context.beginPath();
                this.context.moveTo(xArr[0], yArr[0]);
                for (var i = 1; i < xArr.length; i++) {
                    this.context.lineTo(xArr[i], yArr[i]);
                }
                this.context.closePath();
                if (fill) {
                    this.context.fillStyle = fillColor;
                    this.context.fill();
                }
                if (stroke) {
                    this.context.lineWidth = strokeWidth;
                    this.context.strokeStyle = strokeColor;
                    this.context.stroke();
                }
            };
            /** */
            FloorplannerView.prototype.drawCircle = function (centerX, centerY, radius, fillColor) {
                this.context.beginPath();
                this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                this.context.fillStyle = fillColor;
                this.context.fill();
            };
            /** returns n where -gridSize/2 < n <= gridSize/2  */
            FloorplannerView.prototype.calculateGridOffset = function (n) {
                var gridSpacing = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configGridSpacing);
                if (n >= 0) {
                    return (n + gridSpacing / 2.0) % gridSpacing - gridSpacing / 2.0;
                }
                else {
                    return (n - gridSpacing / 2.0) % gridSpacing + gridSpacing / 2.0;
                }
            };
            /** */
            FloorplannerView.prototype.drawGrid = function () {
                var gridWidth = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configGridWidth);
                var gridSpacing = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configGridSpacing);
                var gridColor = BP3D.Core.Configuration.getStringValue(BP3D.Core.configGridColor);
                var offsetX = this.calculateGridOffset(-this.viewmodel.originX);
                var offsetY = this.calculateGridOffset(-this.viewmodel.originY);
                var width = this.canvasElement.width;
                var height = this.canvasElement.height;
                for (var x = 0; x <= (width / gridSpacing); x++) {
                    this.drawLine(gridSpacing * x + offsetX, 0, gridSpacing * x + offsetX, height, gridWidth, gridColor);
                }
                for (var y = 0; y <= (height / gridSpacing); y++) {
                    this.drawLine(0, gridSpacing * y + offsetY, width, gridSpacing * y + offsetY, gridWidth, gridColor);
                }
            };
            return FloorplannerView;
        })();
        Floorplanner.FloorplannerView = FloorplannerView;
    })(Floorplanner = BP3D.Floorplanner || (BP3D.Floorplanner = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../model/corner.ts" />
/// <reference path="../model/floorplan.ts" />
/// <reference path="../model/wall.ts" />
/// <reference path="floorplanner_view.ts" />
var BP3D;
(function (BP3D) {
    var Floorplanner;
    (function (Floorplanner_1) {
        /** how much will we move a corner to make a wall axis aligned (cm) */
        var snapTolerance = 25;
        /**
         * The Floorplanner implements an interactive tool for creation of floorplans.
         */
        var Floorplanner = (function () {
            /** */
            function Floorplanner(canvas, floorplan) {
                this.floorplan = floorplan;
                /** */
                this.mode = 0;
                /** */
                this.activeWall = null;
                /** */
                this.activeCorner = null;
                /** */
                this.originX = 0;
                /** */
                this.originY = 0;
                /** drawing state */
                this.targetX = 0;
                /** drawing state */
                this.targetY = 0;
                /** drawing state */
                this.lastNode = null;
                /** */
                this.modeResetCallbacks = $.Callbacks();
                /** */
                this.mouseDown = false;
                /** */
                this.mouseMoved = false;
                /** in ThreeJS coords */
                this.mouseX = 0;
                /** in ThreeJS coords */
                this.mouseY = 0;
                /** in ThreeJS coords */
                this.rawMouseX = 0;
                /** in ThreeJS coords */
                this.rawMouseY = 0;
                /** mouse position at last click */
                this.lastX = 0;
                /** mouse position at last click */
                this.lastY = 0;
                this.canvasElement = $("#" + canvas);
                this.view = new Floorplanner_1.FloorplannerView(this.floorplan, this, canvas);
                var cmPerFoot = 30.48;
                var pixelsPerFoot = 15.0;
                this.cmPerPixel = cmPerFoot * (1.0 / pixelsPerFoot);
                this.pixelsPerCm = 1.0 / this.cmPerPixel;
                this.wallWidth = 10.0 * this.pixelsPerCm;
                // Initialization:
                this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                var scope = this;
                this.canvasElement.mousedown(function () {
                    scope.mousedown();
                });
                this.canvasElement.mousemove(function (event) {
                    scope.mousemove(event);
                });
                this.canvasElement.mouseup(function () {
                    scope.mouseup();
                });
                this.canvasElement.mouseleave(function () {
                    scope.mouseleave();
                });
                $(document).keyup(function (e) {
                    if (e.keyCode == 27) {
                        scope.escapeKey();
                    }
                });
                floorplan.roomLoadedCallbacks.add(function () {
                    scope.reset();
                });
            }
            /** */
            Floorplanner.prototype.escapeKey = function () {
                this.setMode(Floorplanner_1.floorplannerModes.MOVE);
            };
            /** */
            Floorplanner.prototype.updateTarget = function () {
                if (this.mode == Floorplanner_1.floorplannerModes.DRAW && this.lastNode) {
                    if (Math.abs(this.mouseX - this.lastNode.x) < snapTolerance) {
                        this.targetX = this.lastNode.x;
                    }
                    else {
                        this.targetX = this.mouseX;
                    }
                    if (Math.abs(this.mouseY - this.lastNode.y) < snapTolerance) {
                        this.targetY = this.lastNode.y;
                    }
                    else {
                        this.targetY = this.mouseY;
                    }
                }
                else {
                    this.targetX = this.mouseX;
                    this.targetY = this.mouseY;
                }
                this.view.draw();
            };
            /** */
            Floorplanner.prototype.mousedown = function () {
                this.mouseDown = true;
                this.mouseMoved = false;
                this.lastX = this.rawMouseX;
                this.lastY = this.rawMouseY;
                // delete
                if (this.mode == Floorplanner_1.floorplannerModes.DELETE) {
                    if (this.activeCorner) {
                        this.activeCorner.removeAll();
                    }
                    else if (this.activeWall) {
                        this.activeWall.remove();
                    }
                    else {
                        this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                    }
                }
            };
            /** */
            Floorplanner.prototype.mousemove = function (event) {
                this.mouseMoved = true;
                // update mouse
                this.rawMouseX = event.clientX;
                this.rawMouseY = event.clientY;
                this.mouseX = (event.clientX - this.canvasElement.offset().left) * this.cmPerPixel + this.originX * this.cmPerPixel;
                this.mouseY = (event.clientY - this.canvasElement.offset().top) * this.cmPerPixel + this.originY * this.cmPerPixel;
                // update target (snapped position of actual mouse)
                if (this.mode == Floorplanner_1.floorplannerModes.DRAW || (this.mode == Floorplanner_1.floorplannerModes.MOVE && this.mouseDown)) {
                    this.updateTarget();
                }
                // update object target
                if (this.mode != Floorplanner_1.floorplannerModes.DRAW && !this.mouseDown) {
                    var hoverCorner = this.floorplan.overlappedCorner(this.mouseX, this.mouseY);
                    var hoverWall = this.floorplan.overlappedWall(this.mouseX, this.mouseY);
                    var draw = false;
                    if (hoverCorner != this.activeCorner) {
                        this.activeCorner = hoverCorner;
                        draw = true;
                    }
                    // corner takes precendence
                    if (this.activeCorner == null) {
                        if (hoverWall != this.activeWall) {
                            this.activeWall = hoverWall;
                            draw = true;
                        }
                    }
                    else {
                        this.activeWall = null;
                    }
                    if (draw) {
                        this.view.draw();
                    }
                }
                // panning
                if (this.mouseDown && !this.activeCorner && !this.activeWall) {
                    this.originX += (this.lastX - this.rawMouseX);
                    this.originY += (this.lastY - this.rawMouseY);
                    this.lastX = this.rawMouseX;
                    this.lastY = this.rawMouseY;
                    this.view.draw();
                }
                // dragging
                if (this.mode == Floorplanner_1.floorplannerModes.MOVE && this.mouseDown) {
                    if (this.activeCorner) {
                        this.activeCorner.move(this.mouseX, this.mouseY);
                        this.activeCorner.snapToAxis(snapTolerance);
                    }
                    else if (this.activeWall) {
                        this.activeWall.relativeMove((this.rawMouseX - this.lastX) * this.cmPerPixel, (this.rawMouseY - this.lastY) * this.cmPerPixel);
                        this.activeWall.snapToAxis(snapTolerance);
                        this.lastX = this.rawMouseX;
                        this.lastY = this.rawMouseY;
                    }
                    this.view.draw();
                }
            };
            /** */
            Floorplanner.prototype.mouseup = function () {
                this.mouseDown = false;
                // drawing
                if (this.mode == Floorplanner_1.floorplannerModes.DRAW && !this.mouseMoved) {
                    var corner = this.floorplan.newCorner(this.targetX, this.targetY);
                    if (this.lastNode != null) {
                        this.floorplan.newWall(this.lastNode, corner);
                    }
                    if (corner.mergeWithIntersected() && this.lastNode != null) {
                        this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                    }
                    this.lastNode = corner;
                }
            };
            /** */
            Floorplanner.prototype.mouseleave = function () {
                this.mouseDown = false;
                //scope.setMode(scope.modes.MOVE);
            };
            /** */
            Floorplanner.prototype.reset = function () {
                this.resizeView();
                this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                this.resetOrigin();
                this.view.draw();
            };
            /** */
            Floorplanner.prototype.resizeView = function () {
                this.view.handleWindowResize();
            };
            /** */
            Floorplanner.prototype.setMode = function (mode) {
                this.lastNode = null;
                this.mode = mode;
                this.modeResetCallbacks.fire(mode);
                this.updateTarget();
            };
            /** Sets the origin so that floorplan is centered */
            Floorplanner.prototype.resetOrigin = function () {
                var centerX = this.canvasElement.innerWidth() / 2.0;
                var centerY = this.canvasElement.innerHeight() / 2.0;
                var centerFloorplan = this.floorplan.getCenter();
                this.originX = centerFloorplan.x * this.pixelsPerCm - centerX;
                this.originY = centerFloorplan.z * this.pixelsPerCm - centerY;
            };
            /** Convert from THREEjs coords to canvas coords. */
            Floorplanner.prototype.convertX = function (x) {
                return (x - this.originX * this.cmPerPixel) * this.pixelsPerCm;
            };
            /** Convert from THREEjs coords to canvas coords. */
            Floorplanner.prototype.convertY = function (y) {
                return (y - this.originY * this.cmPerPixel) * this.pixelsPerCm;
            };
            return Floorplanner;
        })();
        Floorplanner_1.Floorplanner = Floorplanner;
    })(Floorplanner = BP3D.Floorplanner || (BP3D.Floorplanner = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Controller = function (three, model, camera, element, controls, hud) {
            var scope = this;
            this.enabled = true;
            var three = three;
            var model = model;
            var scene = model.scene;
            var element = element;
            var camera = camera;
            var controls = controls;
            var hud = hud;
            var plane; // ground plane used for intersection testing
            var mouse;
            var intersectedObject;
            var mouseoverObject;
            var selectedObject;
            var mouseDown = false;
            var mouseMoved = false; // has mouse moved since down click
            var rotateMouseOver = false;
            var states = {
                UNSELECTED: 0,
                SELECTED: 1,
                DRAGGING: 2,
                ROTATING: 3,
                ROTATING_FREE: 4,
                PANNING: 5
            };
            var state = states.UNSELECTED;
            this.needsUpdate = true;
            function init() {
                element.mousedown(mouseDownEvent);
                element.mouseup(mouseUpEvent);
                element.mousemove(mouseMoveEvent);
                mouse = new THREE.Vector2();
                scene.itemRemovedCallbacks.add(itemRemoved);
                scene.itemLoadedCallbacks.add(itemLoaded);
                setGroundPlane();
            }
            // invoked via callback when item is loaded
            function itemLoaded(item) {
                if (!item.position_set) {
                    scope.setSelectedObject(item);
                    switchState(states.DRAGGING);
                    var pos = item.position.clone();
                    pos.y = 0;
                    var vec = three.projectVector(pos);
                    clickPressed(vec);
                }
                item.position_set = true;
            }
            function clickPressed(vec2) {
                vec2 = vec2 || mouse;
                var intersection = scope.itemIntersection(mouse, selectedObject);
                if (intersection) {
                    selectedObject.clickPressed(intersection);
                }
            }
            function clickDragged(vec2) {
                vec2 = vec2 || mouse;
                var intersection = scope.itemIntersection(mouse, selectedObject);
                if (intersection) {
                    if (scope.isRotating()) {
                        selectedObject.rotate(intersection);
                    }
                    else {
                        selectedObject.clickDragged(intersection);
                    }
                }
            }
            function itemRemoved(item) {
                // invoked as a callback to event in Scene
                if (item === selectedObject) {
                    selectedObject.setUnselected();
                    selectedObject.mouseOff();
                    scope.setSelectedObject(null);
                }
            }
            function setGroundPlane() {
                // ground plane used to find intersections
                var size = 10000;
                plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial());
                plane.rotation.x = -Math.PI / 2;
                plane.visible = false;
                scene.add(plane);
            }
            function checkWallsAndFloors(event) {
                // double click on a wall or floor brings up texture change modal
                if (state == states.UNSELECTED && mouseoverObject == null) {
                    // check walls
                    var wallEdgePlanes = model.floorplan.wallEdgePlanes();
                    var wallIntersects = scope.getIntersections(mouse, wallEdgePlanes, true);
                    if (wallIntersects.length > 0) {
                        var wall = wallIntersects[0].object.edge;
                        three.wallClicked.fire(wall);
                        return;
                    }
                    // check floors
                    var floorPlanes = model.floorplan.floorPlanes();
                    var floorIntersects = scope.getIntersections(mouse, floorPlanes, false);
                    if (floorIntersects.length > 0) {
                        var room = floorIntersects[0].object.room;
                        three.floorClicked.fire(room);
                        return;
                    }
                    three.nothingClicked.fire();
                }
            }
            function mouseMoveEvent(event) {
                if (scope.enabled) {
                    event.preventDefault();
                    mouseMoved = true;
                    mouse.x = event.clientX;
                    mouse.y = event.clientY;
                    if (!mouseDown) {
                        updateIntersections();
                    }
                    switch (state) {
                        case states.UNSELECTED:
                            updateMouseover();
                            break;
                        case states.SELECTED:
                            updateMouseover();
                            break;
                        case states.DRAGGING:
                        case states.ROTATING:
                        case states.ROTATING_FREE:
                            clickDragged();
                            hud.update();
                            scope.needsUpdate = true;
                            break;
                    }
                }
            }
            this.isRotating = function () {
                return (state == states.ROTATING || state == states.ROTATING_FREE);
            };
            function mouseDownEvent(event) {
                if (scope.enabled) {
                    event.preventDefault();
                    mouseMoved = false;
                    mouseDown = true;
                    switch (state) {
                        case states.SELECTED:
                            if (rotateMouseOver) {
                                switchState(states.ROTATING);
                            }
                            else if (intersectedObject != null) {
                                scope.setSelectedObject(intersectedObject);
                                if (!intersectedObject.fixed) {
                                    switchState(states.DRAGGING);
                                }
                            }
                            break;
                        case states.UNSELECTED:
                            if (intersectedObject != null) {
                                scope.setSelectedObject(intersectedObject);
                                if (!intersectedObject.fixed) {
                                    switchState(states.DRAGGING);
                                }
                            }
                            break;
                        case states.DRAGGING:
                        case states.ROTATING:
                            break;
                        case states.ROTATING_FREE:
                            switchState(states.SELECTED);
                            break;
                    }
                }
            }
            function mouseUpEvent(event) {
                if (scope.enabled) {
                    mouseDown = false;
                    switch (state) {
                        case states.DRAGGING:
                            selectedObject.clickReleased();
                            switchState(states.SELECTED);
                            break;
                        case states.ROTATING:
                            if (!mouseMoved) {
                                switchState(states.ROTATING_FREE);
                            }
                            else {
                                switchState(states.SELECTED);
                            }
                            break;
                        case states.UNSELECTED:
                            if (!mouseMoved) {
                                checkWallsAndFloors();
                            }
                            break;
                        case states.SELECTED:
                            if (intersectedObject == null && !mouseMoved) {
                                switchState(states.UNSELECTED);
                                checkWallsAndFloors();
                            }
                            break;
                        case states.ROTATING_FREE:
                            break;
                    }
                }
            }
            function switchState(newState) {
                if (newState != state) {
                    onExit(state);
                    onEntry(newState);
                }
                state = newState;
                hud.setRotating(scope.isRotating());
            }
            function onEntry(state) {
                switch (state) {
                    case states.UNSELECTED:
                        scope.setSelectedObject(null);
                    case states.SELECTED:
                        controls.enabled = true;
                        break;
                    case states.ROTATING:
                    case states.ROTATING_FREE:
                        controls.enabled = false;
                        break;
                    case states.DRAGGING:
                        three.setCursorStyle("move");
                        clickPressed();
                        controls.enabled = false;
                        break;
                }
            }
            function onExit(state) {
                switch (state) {
                    case states.UNSELECTED:
                    case states.SELECTED:
                        break;
                    case states.DRAGGING:
                        if (mouseoverObject) {
                            three.setCursorStyle("pointer");
                        }
                        else {
                            three.setCursorStyle("auto");
                        }
                        break;
                    case states.ROTATING:
                    case states.ROTATING_FREE:
                        break;
                }
            }
            this.selectedObject = function () {
                return selectedObject;
            };
            // updates the vector of the intersection with the plane of a given
            // mouse position, and the intersected object
            // both may be set to null if no intersection found
            function updateIntersections() {
                // check the rotate arrow
                var hudObject = hud.getObject();
                if (hudObject != null) {
                    var hudIntersects = scope.getIntersections(mouse, hudObject, false, false, true);
                    if (hudIntersects.length > 0) {
                        rotateMouseOver = true;
                        hud.setMouseover(true);
                        intersectedObject = null;
                        return;
                    }
                }
                rotateMouseOver = false;
                hud.setMouseover(false);
                // check objects
                var items = model.scene.getItems();
                var intersects = scope.getIntersections(mouse, items, false, true);
                if (intersects.length > 0) {
                    intersectedObject = intersects[0].object;
                }
                else {
                    intersectedObject = null;
                }
            }
            // sets coords to -1 to 1
            function normalizeVector2(vec2) {
                var retVec = new THREE.Vector2();
                retVec.x = ((vec2.x - three.widthMargin) / (window.innerWidth - three.widthMargin)) * 2 - 1;
                retVec.y = -((vec2.y - three.heightMargin) / (window.innerHeight - three.heightMargin)) * 2 + 1;
                return retVec;
            }
            //
            function mouseToVec3(vec2) {
                var normVec2 = normalizeVector2(vec2);
                var vector = new THREE.Vector3(normVec2.x, normVec2.y, 0.5);
                vector.unproject(camera);
                return vector;
            }
            // returns the first intersection object
            this.itemIntersection = function (vec2, item) {
                var customIntersections = item.customIntersectionPlanes();
                var intersections = null;
                if (customIntersections && customIntersections.length > 0) {
                    intersections = this.getIntersections(vec2, customIntersections, true);
                }
                else {
                    intersections = this.getIntersections(vec2, plane);
                }
                if (intersections.length > 0) {
                    return intersections[0];
                }
                else {
                    return null;
                }
            };
            // filter by normals will only return objects facing the camera
            // objects can be an array of objects or a single object
            this.getIntersections = function (vec2, objects, filterByNormals, onlyVisible, recursive, linePrecision) {
                var vector = mouseToVec3(vec2);
                onlyVisible = onlyVisible || false;
                filterByNormals = filterByNormals || false;
                recursive = recursive || false;
                linePrecision = linePrecision || 20;
                var direction = vector.sub(camera.position).normalize();
                var raycaster = new THREE.Raycaster(camera.position, direction);
                raycaster.linePrecision = linePrecision;
                var intersections;
                if (objects instanceof Array) {
                    intersections = raycaster.intersectObjects(objects, recursive);
                }
                else {
                    intersections = raycaster.intersectObject(objects, recursive);
                }
                // filter by visible, if true
                if (onlyVisible) {
                    intersections = BP3D.Core.Utils.removeIf(intersections, function (intersection) {
                        return !intersection.object.visible;
                    });
                }
                // filter by normals, if true
                if (filterByNormals) {
                    intersections = BP3D.Core.Utils.removeIf(intersections, function (intersection) {
                        var dot = intersection.face.normal.dot(direction);
                        return (dot > 0);
                    });
                }
                return intersections;
            };
            // manage the selected object
            this.setSelectedObject = function (object) {
                if (state === states.UNSELECTED) {
                    switchState(states.SELECTED);
                }
                if (selectedObject != null) {
                    selectedObject.setUnselected();
                }
                if (object != null) {
                    selectedObject = object;
                    selectedObject.setSelected();
                    three.itemSelectedCallbacks.fire(object);
                }
                else {
                    selectedObject = null;
                    three.itemUnselectedCallbacks.fire();
                }
                this.needsUpdate = true;
            };
            // TODO: there MUST be simpler logic for expressing this
            function updateMouseover() {
                if (intersectedObject != null) {
                    if (mouseoverObject != null) {
                        if (mouseoverObject !== intersectedObject) {
                            mouseoverObject.mouseOff();
                            mouseoverObject = intersectedObject;
                            mouseoverObject.mouseOver();
                            scope.needsUpdate = true;
                        }
                        else {
                        }
                    }
                    else {
                        mouseoverObject = intersectedObject;
                        mouseoverObject.mouseOver();
                        three.setCursorStyle("pointer");
                        scope.needsUpdate = true;
                    }
                }
                else if (mouseoverObject != null) {
                    mouseoverObject.mouseOff();
                    three.setCursorStyle("auto");
                    mouseoverObject = null;
                    scope.needsUpdate = true;
                }
            }
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Floor = function (scene, room) {
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
                // setup texture
                // new texture loader
                //var loader = new THREE.TextureLoader();
                //var floorTexture = loader.load(textureSettings.url);
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
                var textureScale = textureSettings.scale;
                // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
                // scale down coords to fit 0 -> 1, then rescale
                var points = [];
                scope.room.interiorCorners.forEach(function (corner) {
                    points.push(new THREE.Vector2(corner.x / textureScale, corner.y / textureScale));
                });
                var shape = new THREE.Shape(points);
                var geometry = new THREE.ShapeGeometry(shape);
                var floor = new THREE.Mesh(geometry, floorMaterialTop);
                floor.rotation.set(Math.PI / 2, 0, 0);
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
                scope.room.interiorCorners.forEach(function (corner) {
                    points.push(new THREE.Vector2(corner.x, corner.y));
                });
                var shape = new THREE.Shape(points);
                var geometry = new THREE.ShapeGeometry(shape);
                var roof = new THREE.Mesh(geometry, roofMaterial);
                roof.rotation.set(Math.PI / 2, 0, 0);
                roof.position.y = 250;
                return roof;
            }
            this.addToScene = function () {
                if (Three.HierarchyConfig.CreateHierarchy) {
                    var tObj = new THREE.Object3D();
                    scene.getScene().add(tObj);
                    var tId = Three.HierarchyConfig.Prefix + (Three.HierarchyConfig.FirstFreeNumber) + (Three.HierarchyConfig.PrefixLevel ? "" : Three.HierarchyConfig.Postfix);
                    tObj.name = tId;
                    var tMeshParent = tObj;
                    scope.id = tId;
                    if (Three.HierarchyConfig.PrefixLevel == true) {
                        var tImmObj = new THREE.Object3D();
                        tImmObj.name = Three.HierarchyConfig.Prefix + (Three.HierarchyConfig.FirstFreeNumber) + Three.HierarchyConfig.Postfix;
                        tObj.add(tImmObj);
                        tMeshParent = tImmObj;
                    }
                    Three.HierarchyConfig.FirstFreeNumber++;
                    tMeshParent.add(floorPlane);
                }
                else {
                    scene.add(floorPlane);
                    // hack so we can do intersect testing
                    // Todo roofplane handling
                    scene.add(room.floorPlane);
                }
            };
            this.removeFromScene = function () {
                if (Three.HierarchyConfig.CreateHierarchy) {
                    var selectedObject = scene.getScene().getObjectByName(scope.id);
                    console.log(selectedObject);
                    scene.getScene().remove(selectedObject);
                }
                else {
                    scene.remove(floorPlane);
                    //scene.remove(roofPlane);
                    scene.remove(room.floorPlane);
                }
            };
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        var HierarchyConfig = (function () {
            function HierarchyConfig() {
            }
            HierarchyConfig.CreateHierarchy = false;
            HierarchyConfig.Prefix = "wall_";
            HierarchyConfig.Postfix = "_wl";
            HierarchyConfig.PrefixLevel = true;
            HierarchyConfig.FirstFreeNumber = 1;
            return HierarchyConfig;
        })();
        Three.HierarchyConfig = HierarchyConfig;
        Three.Edge = function (scene, edge, controls) {
            var scope = this;
            var scene = scene;
            var edge = edge;
            var controls = controls;
            var wall = edge.wall;
            var front = edge.front;
            var planes = [];
            var basePlanes = []; // always visible
            var texture = null;
            var id = null; //for hierarchy
            // new texture loader
            //var loader = new THREE.TextureLoader();
            //var lightMap = loader.load("rooms/textures/walllightmap.png");
            var lightMap = THREE.ImageUtils.loadTexture("../../shared/rooms/textures/walllightmap.png");
            var fillerColor = 0xdddddd;
            var sideColor = 0xcccccc;
            var baseColor = 0xdddddd;
            this.visible = false;
            this.remove = function () {
                edge.redrawCallbacks.remove(redraw);
                controls.cameraMovedCallbacks.remove(updateVisibility);
                removeFromScene();
            };
            function init() {
                edge.redrawCallbacks.add(redraw);
                controls.cameraMovedCallbacks.add(updateVisibility);
                updateTexture();
                updatePlanes();
                addToScene();
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
                }
                else {
                    planes.forEach(function (plane) {
                        scene.remove(plane);
                    });
                    basePlanes.forEach(function (plane) {
                        scene.remove(plane);
                    });
                }
                planes = [];
                basePlanes = [];
            }
            function addToScene() {
                var tMeshParent = scene.getScene(); // should be Three.scene or three.Object3D
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
                }
                else {
                    console.log(HierarchyConfig);
                }
                planes.forEach(function (plane) {
                    tMeshParent.add(plane);
                });
                basePlanes.forEach(function (plane) {
                    tMeshParent.add(plane);
                });
                updateVisibility();
            }
            function updateVisibility() {
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
                var focus = new THREE.Vector3((start.x + end.x) / 2.0, 0, (start.y + end.y) / 2.0);
                var direction = position.sub(focus).normalize();
                // find dot
                var dot = normal.dot(direction);
                // update visible
                scope.visible = (dot >= 0);
                // show or hide plans
                planes.forEach(function (plane) {
                    plane.visible = scope.visible;
                });
                updateObjectVisibility();
            }
            function updateObjectVisibility() {
                wall.items.forEach(function (item) {
                    item.updateEdgeVisibility(scope.visible, front);
                });
                wall.onItems.forEach(function (item) {
                    item.updateEdgeVisibility(scope.visible, front);
                });
            }
            function updateTexture(callback) {
                // callback is fired when texture loads
                callback = callback || function () {
                    scene.needsUpdate = true;
                };
                var textureData = edge.getTexture();
                var stretch = textureData.stretch;
                var url = textureData.url;
                var scale = textureData.scale;
                // new texture loader
                //var loader = new THREE.TextureLoader();
                //texture = loader.load(url, callback);
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
                });
                var fillerMaterial = new THREE.MeshBasicMaterial({
                    color: fillerColor,
                    side: THREE.DoubleSide
                });
                // exterior plane
                planes.push(makeWall(edge.exteriorStart(), edge.exteriorEnd(), edge.exteriorTransform, edge.invExteriorTransform, fillerMaterial));
                // interior plane
                planes.push(makeWall(edge.interiorStart(), edge.interiorEnd(), edge.interiorTransform, edge.invInteriorTransform, wallMaterial));
                // bottom
                // put into basePlanes since this is always visible
                basePlanes.push(buildFiller(edge, 0, THREE.BackSide, baseColor));
                // top
                planes.push(buildFiller(edge, wall.height, THREE.DoubleSide, fillerColor));
                // sides
                planes.push(buildSideFillter(edge.interiorStart(), edge.exteriorStart(), wall.height, sideColor));
                planes.push(buildSideFillter(edge.interiorEnd(), edge.exteriorEnd(), wall.height, sideColor));
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
                points.forEach(function (p) {
                    p.applyMatrix4(transform);
                });
                var shape = new THREE.Shape([
                    new THREE.Vector2(points[0].x, points[0].y),
                    new THREE.Vector2(points[1].x, points[1].y),
                    new THREE.Vector2(points[2].x, points[2].y),
                    new THREE.Vector2(points[3].x, points[3].y)
                ]);
                // add holes for each wall item
                wall.items.forEach(function (item) {
                    var pos = item.position.clone();
                    pos.applyMatrix4(transform);
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
                geometry.vertices.forEach(function (v) {
                    v.applyMatrix4(invTransform);
                });
                // make UVs
                var totalDistance = BP3D.Core.Utils.distance(v1.x, v1.z, v2.x, v2.z);
                var height = wall.height;
                geometry.faceVertexUvs[0] = [];
                function vertexToUv(vertex) {
                    var x = BP3D.Core.Utils.distance(v1.x, v1.z, vertex.x, vertex.z) / totalDistance;
                    var y = vertex.y / height;
                    return new THREE.Vector2(x, y);
                }
                geometry.faces.forEach(function (face) {
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
                var mesh = new THREE.Mesh(geometry, material);
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
                points.forEach(function (p) {
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
            function toVec3(pos, height) {
                height = height || 0;
                return new THREE.Vector3(pos.x, height, pos.y);
            }
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="floor.ts" />
/// <reference path="edge.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Floorplan = function (scene, floorplan, controls) {
            var scope = this;
            this.scene = scene;
            this.floorplan = floorplan;
            this.controls = controls;
            this.floors = [];
            this.edges = [];
            floorplan.fireOnUpdatedRooms(redraw);
            function redraw() {
                // clear scene
                scope.floors.forEach(function (floor) {
                    floor.removeFromScene();
                });
                scope.edges.forEach(function (edge) {
                    edge.remove();
                });
                scope.floors = [];
                scope.edges = [];
                // draw floors
                scope.floorplan.getRooms().forEach(function (room) {
                    var threeFloor = new Three.Floor(scene, room);
                    scope.floors.push(threeFloor);
                    threeFloor.addToScene();
                });
                // draw edges
                scope.floorplan.wallEdges().forEach(function (edge) {
                    var threeEdge = new Three.Edge(scene, edge, scope.controls);
                    scope.edges.push(threeEdge);
                });
            }
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Lights = function (scene, floorplan) {
            var scope = this;
            var scene = scene;
            var floorplan = floorplan;
            var tol = 1;
            var height = 300; // TODO: share with Blueprint.Wall
            var dirLight;
            this.getDirLight = function () {
                return dirLight;
            };
            function init() {
                var light = new THREE.HemisphereLight(0xffffff, 0x888888, 1.1);
                light.position.set(0, height, 0);
                scene.add(light);
                dirLight = new THREE.DirectionalLight(0xffffff, 0);
                dirLight.color.setHSL(1, 1, 0.1);
                dirLight.castShadow = true;
                dirLight.shadowMapWidth = 1024;
                dirLight.shadowMapHeight = 1024;
                dirLight.shadowCameraFar = height + tol;
                dirLight.shadowBias = -0.0001;
                dirLight.shadowDarkness = 0.2;
                dirLight.visible = true;
                dirLight.shadowCameraVisible = false;
                scene.add(dirLight);
                scene.add(dirLight.target);
                floorplan.fireOnUpdatedRooms(updateShadowCamera);
            }
            function updateShadowCamera() {
                var size = floorplan.getSize();
                var d = (Math.max(size.z, size.x) + tol) / 2.0;
                var center = floorplan.getCenter();
                var pos = new THREE.Vector3(center.x, height, center.z);
                dirLight.position.copy(pos);
                dirLight.target.position.copy(center);
                //dirLight.updateMatrix();
                //dirLight.updateWorldMatrix()
                dirLight.shadowCameraLeft = -d;
                dirLight.shadowCameraRight = d;
                dirLight.shadowCameraTop = d;
                dirLight.shadowCameraBottom = -d;
                // this is necessary for updates
                if (dirLight.shadowCamera) {
                    dirLight.shadowCamera.left = dirLight.shadowCameraLeft;
                    dirLight.shadowCamera.right = dirLight.shadowCameraRight;
                    dirLight.shadowCamera.top = dirLight.shadowCameraTop;
                    dirLight.shadowCamera.bottom = dirLight.shadowCameraBottom;
                    dirLight.shadowCamera.updateProjectionMatrix();
                }
            }
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Skybox = function (scene) {
            var scope = this;
            var scene = scene;
            var topColor = 0xffffff; //0xD8ECF9
            var bottomColor = 0xe9e9e9; //0xf9f9f9;//0x565e63
            var verticalOffset = 500;
            var sphereRadius = 4000;
            var widthSegments = 32;
            var heightSegments = 15;
            var vertexShader = [
                "varying vec3 vWorldPosition;",
                "void main() {",
                "  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
                "  vWorldPosition = worldPosition.xyz;",
                "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "}"
            ].join('\n');
            var fragmentShader = [
                "uniform vec3 topColor;",
                "uniform vec3 bottomColor;",
                "uniform float offset;",
                "varying vec3 vWorldPosition;",
                "void main() {",
                "  float h = normalize( vWorldPosition + offset ).y;",
                "  gl_FragColor = vec4( mix( bottomColor, topColor, (h + 1.0) / 2.0), 1.0 );",
                "}"
            ].join('\n');
            function init() {
                var uniforms = {
                    topColor: {
                        type: "c",
                        value: new THREE.Color(topColor)
                    },
                    bottomColor: {
                        type: "c",
                        value: new THREE.Color(bottomColor)
                    },
                    offset: {
                        type: "f",
                        value: verticalOffset
                    }
                };
                var skyGeo = new THREE.SphereGeometry(sphereRadius, widthSegments, heightSegments);
                var skyMat = new THREE.ShaderMaterial({
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    uniforms: uniforms,
                    side: THREE.BackSide
                });
                var sky = new THREE.Mesh(skyGeo, skyMat);
                scene.add(sky);
            }
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/**
This file is a modified version of THREE.OrbitControls
Contributors:
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.Controls = function (object, domElement) {
            this.object = object;
            this.domElement = (domElement !== undefined) ? domElement : document;
            // Set to false to disable this control
            this.enabled = true;
            // "target" sets the location of focus, where the control orbits around
            // and where it pans with respect to.
            this.target = new THREE.Vector3();
            // center is old, deprecated; use "target" instead
            this.center = this.target;
            // This option actually enables dollying in and out; left as "zoom" for
            // backwards compatibility
            this.noZoom = false;
            this.zoomSpeed = 1.0;
            // Limits to how far you can dolly in and out
            this.minDistance = 0;
            this.maxDistance = 1500; //Infinity;
            // Set to true to disable this control
            this.noRotate = false;
            this.rotateSpeed = 1.0;
            // Set to true to disable this control
            this.noPan = false;
            this.keyPanSpeed = 40.0; // pixels moved per arrow key push
            // Set to true to automatically rotate around the target
            this.autoRotate = false;
            this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
            // How far you can orbit vertically, upper and lower limits.
            // Range is 0 to Math.PI radians.
            this.minPolarAngle = 0; // radians
            this.maxPolarAngle = Math.PI / 2; // radians
            // Set to true to disable use of the keys
            this.noKeys = false;
            // The four arrow keys
            this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
            this.cameraMovedCallbacks = $.Callbacks();
            this.needsUpdate = true;
            // internals
            var scope = this;
            var EPS = 0.000001;
            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();
            var panStart = new THREE.Vector2();
            var panEnd = new THREE.Vector2();
            var panDelta = new THREE.Vector2();
            var dollyStart = new THREE.Vector2();
            var dollyEnd = new THREE.Vector2();
            var dollyDelta = new THREE.Vector2();
            var phiDelta = 0;
            var thetaDelta = 0;
            var scale = 1;
            var pan = new THREE.Vector3();
            var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
            var state = STATE.NONE;
            this.controlsActive = function () {
                return (state === STATE.NONE);
            };
            this.setPan = function (vec3) {
                pan = vec3;
            };
            this.panTo = function (vec3) {
                var newTarget = new THREE.Vector3(vec3.x, scope.target.y, vec3.z);
                var delta = scope.target.clone().sub(newTarget);
                pan.sub(delta);
                scope.update();
            };
            this.rotateLeft = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle();
                }
                thetaDelta -= angle;
            };
            this.rotateUp = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle();
                }
                phiDelta -= angle;
            };
            // pass in distance in world space to move left
            this.panLeft = function (distance) {
                var panOffset = new THREE.Vector3();
                var te = this.object.matrix.elements;
                // get X column of matrix
                panOffset.set(te[0], 0, te[2]);
                panOffset.normalize();
                panOffset.multiplyScalar(-distance);
                pan.add(panOffset);
            };
            // pass in distance in world space to move up
            this.panUp = function (distance) {
                var panOffset = new THREE.Vector3();
                var te = this.object.matrix.elements;
                // get Y column of matrix
                panOffset.set(te[4], 0, te[6]);
                panOffset.normalize();
                panOffset.multiplyScalar(distance);
                pan.add(panOffset);
            };
            // main entry point; pass in Vector2 of change desired in pixel space,
            // right and down are positive
            this.pan = function (delta) {
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                if (scope.object.fov !== undefined) {
                    // perspective
                    var position = scope.object.position;
                    var offset = position.clone().sub(scope.target);
                    var targetDistance = offset.length();
                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
                    // we actually don't use screenWidth, since perspective camera is fixed to screen height
                    scope.panLeft(2 * delta.x * targetDistance / element.clientHeight);
                    scope.panUp(2 * delta.y * targetDistance / element.clientHeight);
                }
                else if (scope.object.top !== undefined) {
                    // orthographic
                    scope.panLeft(delta.x * (scope.object.right - scope.object.left) / element.clientWidth);
                    scope.panUp(delta.y * (scope.object.top - scope.object.bottom) / element.clientHeight);
                }
                else {
                    // camera neither orthographic or perspective - warn user
                    console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                }
                scope.update();
            };
            this.panXY = function (x, y) {
                scope.pan(new THREE.Vector2(x, y));
            };
            this.dollyIn = function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = getZoomScale();
                }
                scale /= dollyScale;
            };
            this.dollyOut = function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = getZoomScale();
                }
                scale *= dollyScale;
            };
            this.update = function () {
                var position = this.object.position;
                var offset = position.clone().sub(this.target);
                // angle from z-axis around y-axis
                var theta = Math.atan2(offset.x, offset.z);
                // angle from y-axis
                var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
                if (this.autoRotate) {
                    this.rotateLeft(getAutoRotationAngle());
                }
                theta += thetaDelta;
                phi += phiDelta;
                // restrict phi to be between desired limits
                phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
                // restrict phi to be betwee EPS and PI-EPS
                phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
                var radius = offset.length() * scale;
                // restrict radius to be between desired limits
                radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
                // move target to panned location
                this.target.add(pan);
                offset.x = radius * Math.sin(phi) * Math.sin(theta);
                offset.y = radius * Math.cos(phi);
                offset.z = radius * Math.sin(phi) * Math.cos(theta);
                position.copy(this.target).add(offset);
                this.object.lookAt(this.target);
                thetaDelta = 0;
                phiDelta = 0;
                scale = 1;
                pan.set(0, 0, 0);
                this.cameraMovedCallbacks.fire();
                this.needsUpdate = true;
            };
            function getAutoRotationAngle() {
                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
            }
            function getZoomScale() {
                return Math.pow(0.95, scope.zoomSpeed);
            }
            function onMouseDown(event) {
                if (scope.enabled === false) {
                    return;
                }
                event.preventDefault();
                if (event.button === 0) {
                    if (scope.noRotate === true) {
                        return;
                    }
                    state = STATE.ROTATE;
                    rotateStart.set(event.clientX, event.clientY);
                }
                else if (event.button === 1) {
                    if (scope.noZoom === true) {
                        return;
                    }
                    state = STATE.DOLLY;
                    dollyStart.set(event.clientX, event.clientY);
                }
                else if (event.button === 2) {
                    if (scope.noPan === true) {
                        return;
                    }
                    state = STATE.PAN;
                    panStart.set(event.clientX, event.clientY);
                }
                // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
                scope.domElement.addEventListener('mousemove', onMouseMove, false);
                scope.domElement.addEventListener('mouseup', onMouseUp, false);
            }
            function onMouseMove(event) {
                if (scope.enabled === false)
                    return;
                event.preventDefault();
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                if (state === STATE.ROTATE) {
                    if (scope.noRotate === true)
                        return;
                    rotateEnd.set(event.clientX, event.clientY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);
                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                    rotateStart.copy(rotateEnd);
                }
                else if (state === STATE.DOLLY) {
                    if (scope.noZoom === true)
                        return;
                    dollyEnd.set(event.clientX, event.clientY);
                    dollyDelta.subVectors(dollyEnd, dollyStart);
                    if (dollyDelta.y > 0) {
                        scope.dollyIn();
                    }
                    else {
                        scope.dollyOut();
                    }
                    dollyStart.copy(dollyEnd);
                }
                else if (state === STATE.PAN) {
                    if (scope.noPan === true)
                        return;
                    panEnd.set(event.clientX, event.clientY);
                    panDelta.subVectors(panEnd, panStart);
                    scope.pan(panDelta);
                    panStart.copy(panEnd);
                }
                // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
                scope.update();
            }
            function onMouseUp() {
                if (scope.enabled === false)
                    return;
                // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
                scope.domElement.removeEventListener('mousemove', onMouseMove, false);
                scope.domElement.removeEventListener('mouseup', onMouseUp, false);
                state = STATE.NONE;
            }
            function onMouseWheel(event) {
                if (scope.enabled === false || scope.noZoom === true)
                    return;
                var delta = 0;
                if (event.wheelDelta) {
                    delta = event.wheelDelta;
                }
                else if (event.detail) {
                    delta = -event.detail;
                }
                if (delta > 0) {
                    scope.dollyOut();
                }
                else {
                    scope.dollyIn();
                }
                scope.update();
            }
            function onKeyDown(event) {
                if (scope.enabled === false) {
                    return;
                }
                if (scope.noKeys === true) {
                    return;
                }
                if (scope.noPan === true) {
                    return;
                }
                switch (event.keyCode) {
                    case scope.keys.UP:
                        scope.pan(new THREE.Vector2(0, scope.keyPanSpeed));
                        break;
                    case scope.keys.BOTTOM:
                        scope.pan(new THREE.Vector2(0, -scope.keyPanSpeed));
                        break;
                    case scope.keys.LEFT:
                        scope.pan(new THREE.Vector2(scope.keyPanSpeed, 0));
                        break;
                    case scope.keys.RIGHT:
                        scope.pan(new THREE.Vector2(-scope.keyPanSpeed, 0));
                        break;
                }
            }
            function touchstart(event) {
                if (scope.enabled === false) {
                    return;
                }
                switch (event.touches.length) {
                    case 1:
                        if (scope.noRotate === true) {
                            return;
                        }
                        state = STATE.TOUCH_ROTATE;
                        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        break;
                    case 2:
                        if (scope.noZoom === true) {
                            return;
                        }
                        state = STATE.TOUCH_DOLLY;
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        dollyStart.set(0, distance);
                        break;
                    case 3:
                        if (scope.noPan === true) {
                            return;
                        }
                        state = STATE.TOUCH_PAN;
                        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        break;
                    default:
                        state = STATE.NONE;
                }
            }
            function touchmove(event) {
                if (scope.enabled === false) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                switch (event.touches.length) {
                    case 1:
                        if (scope.noRotate === true) {
                            return;
                        }
                        if (state !== STATE.TOUCH_ROTATE) {
                            return;
                        }
                        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        rotateDelta.subVectors(rotateEnd, rotateStart);
                        // rotating across whole screen goes 360 degrees around
                        scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                        // rotating up and down along whole screen attempts to go 360, but limited to 180
                        scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                        rotateStart.copy(rotateEnd);
                        break;
                    case 2:
                        if (scope.noZoom === true) {
                            return;
                        }
                        if (state !== STATE.TOUCH_DOLLY) {
                            return;
                        }
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        dollyEnd.set(0, distance);
                        dollyDelta.subVectors(dollyEnd, dollyStart);
                        if (dollyDelta.y > 0) {
                            scope.dollyOut();
                        }
                        else {
                            scope.dollyIn();
                        }
                        dollyStart.copy(dollyEnd);
                        break;
                    case 3:
                        if (scope.noPan === true) {
                            return;
                        }
                        if (state !== STATE.TOUCH_PAN) {
                            return;
                        }
                        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        panDelta.subVectors(panEnd, panStart);
                        scope.pan(panDelta);
                        panStart.copy(panEnd);
                        break;
                    default:
                        state = STATE.NONE;
                }
            }
            function touchend() {
                if (scope.enabled === false) {
                    return;
                }
                state = STATE.NONE;
            }
            this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
            this.domElement.addEventListener('mousedown', onMouseDown, false);
            this.domElement.addEventListener('mousewheel', onMouseWheel, false);
            this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
            this.domElement.addEventListener('touchstart', touchstart, false);
            this.domElement.addEventListener('touchend', touchend, false);
            this.domElement.addEventListener('touchmove', touchmove, false);
            window.addEventListener('keydown', onKeyDown, false);
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/three.d.ts" />
/// <reference path="../core/utils.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        /**
         * Drawings on "top" of the scene. e.g. rotate arrows
         */
        Three.HUD = function (three) {
            var scope = this;
            var three = three;
            var scene = new THREE.Scene();
            var selectedItem = null;
            var rotating = false;
            var mouseover = false;
            var tolerance = 10;
            var height = 5;
            var distance = 20;
            var color = "#ffffff";
            var hoverColor = "#f1c40f";
            var activeObject = null;
            this.getScene = function () {
                return scene;
            };
            this.getObject = function () {
                return activeObject;
            };
            function init() {
                three.itemSelectedCallbacks.add(itemSelected);
                three.itemUnselectedCallbacks.add(itemUnselected);
            }
            function resetSelectedItem() {
                selectedItem = null;
                if (activeObject) {
                    scene.remove(activeObject);
                    activeObject = null;
                }
            }
            function itemSelected(item) {
                if (selectedItem != item) {
                    resetSelectedItem();
                    if (item.allowRotate && !item.fixed) {
                        selectedItem = item;
                        activeObject = makeObject(selectedItem);
                        scene.add(activeObject);
                    }
                }
            }
            function itemUnselected() {
                resetSelectedItem();
            }
            this.setRotating = function (isRotating) {
                rotating = isRotating;
                setColor();
            };
            this.setMouseover = function (isMousedOver) {
                mouseover = isMousedOver;
                setColor();
            };
            function setColor() {
                if (activeObject) {
                    activeObject.children.forEach(function (obj) {
                        obj.material.color.set(getColor());
                    });
                }
                three.needsUpdate();
            }
            function getColor() {
                return (mouseover || rotating) ? hoverColor : color;
            }
            this.update = function () {
                if (activeObject) {
                    activeObject.rotation.y = selectedItem.rotation.y;
                    activeObject.position.x = selectedItem.position.x;
                    activeObject.position.z = selectedItem.position.z;
                }
            };
            function makeLineGeometry(item) {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(0, 0, 0), rotateVector(item));
                return geometry;
            }
            function rotateVector(item) {
                var vec = new THREE.Vector3(0, 0, Math.max(item.halfSize.x, item.halfSize.z) + 1.4 + distance);
                return vec;
            }
            function makeLineMaterial(rotating) {
                var mat = new THREE.LineBasicMaterial({
                    color: getColor(),
                    linewidth: 3
                });
                return mat;
            }
            function makeCone(item) {
                var coneGeo = new THREE.CylinderGeometry(5, 0, 10);
                var coneMat = new THREE.MeshBasicMaterial({
                    color: getColor()
                });
                var cone = new THREE.Mesh(coneGeo, coneMat);
                cone.position.copy(rotateVector(item));
                cone.rotation.x = -Math.PI / 2.0;
                return cone;
            }
            function makeSphere(item) {
                var geometry = new THREE.SphereGeometry(4, 16, 16);
                var material = new THREE.MeshBasicMaterial({
                    color: getColor()
                });
                var sphere = new THREE.Mesh(geometry, material);
                return sphere;
            }
            function makeObject(item) {
                var object = new THREE.Object3D();
                var line = new THREE.Line(makeLineGeometry(item), makeLineMaterial(scope.rotating), THREE.LinePieces);
                var cone = makeCone(item);
                var sphere = makeSphere(item);
                object.add(line);
                object.add(cone);
                object.add(sphere);
                object.rotation.y = item.rotation.y;
                object.position.x = item.position.x;
                object.position.z = item.position.z;
                object.position.y = height;
                return object;
            }
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../../lib/three.d.ts" />
/// <reference path="controller.ts" />
/// <reference path="floorPlan.ts" />
/// <reference path="lights.ts" />
/// <reference path="skybox.ts" />
/// <reference path="controls.ts" />
/// <reference path="hud.ts" />
var BP3D;
(function (BP3D) {
    var Three;
    (function (Three) {
        Three.CmToWorld = 1;
        Three.Main = function (model, element, canvasElement, opts, alreadyRenderer, alreadyScene) {
            var scope = this;
            var foreignRenderer = (alreadyRenderer != null);
            var options = {
                resize: true,
                pushHref: false,
                spin: true,
                spinSpeed: .00002,
                clickPan: true,
                canMoveFixedItems: false
            };
            // override with manually set options
            for (var opt in options) {
                if (options.hasOwnProperty(opt) && opts.hasOwnProperty(opt)) {
                    options[opt] = opts[opt];
                }
            }
            var scene = model.scene;
            if (alreadyScene != null) {
                scene = alreadyScene;
            }
            var model = model;
            this.element = $(element);
            var domElement;
            var camera;
            var renderer;
            this.controls;
            var canvas;
            var controller;
            var floorplan;
            //var canvas;
            //var canvasElement = canvasElement;
            var needsUpdate = false;
            var lastRender = Date.now();
            var mouseOver = false;
            var hasClicked = false;
            var hud;
            this.heightMargin;
            this.widthMargin;
            this.elementHeight;
            this.elementWidth;
            this.itemSelectedCallbacks = $.Callbacks(); // item
            this.itemUnselectedCallbacks = $.Callbacks();
            this.wallClicked = $.Callbacks(); // wall
            this.floorClicked = $.Callbacks(); // floor
            this.nothingClicked = $.Callbacks();
            function init() {
                THREE.ImageUtils.crossOrigin = "";
                domElement = scope.element.get(0); // Container
                camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
                //      if (false || alreadyRenderer) {
                //          renderer = alreadyRenderer;
                //          hasOwnRenderer = false;
                //      }
                //      else {	
                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    preserveDrawingBuffer: true // required to support .toDataURL()
                });
                renderer.autoClear = false,
                    renderer.shadowMapEnabled = true;
                renderer.shadowMapSoft = true;
                renderer.shadowMapType = THREE.PCFSoftShadowMap;
                //    }
                var skybox = new Three.Skybox(scene);
                scope.controls = new Three.Controls(camera, domElement);
                hud = new Three.HUD(scope);
                controller = new Three.Controller(scope, model, camera, scope.element, scope.controls, hud);
                domElement.appendChild(renderer.domElement);
                // handle window resizing
                scope.updateWindowSize();
                if (options.resize) {
                    $(window).resize(scope.updateWindowSize);
                }
                // setup camera nicely
                scope.centerCamera();
                model.floorplan.fireOnUpdatedRooms(scope.centerCamera);
                if (!alreadyRenderer) {
                    var lights = new Three.Lights(scene, model.floorplan);
                }
                floorplan = new Three.Floorplan(scene, model.floorplan, scope.controls);
                animate();
                scope.element.mouseenter(function () {
                    mouseOver = true;
                }).mouseleave(function () {
                    mouseOver = false;
                }).click(function () {
                    hasClicked = true;
                });
                //canvas = new ThreeCanvas(canvasElement, scope);
            }
            function spin() {
                if (options.spin && !mouseOver && !hasClicked) {
                    var theta = 2 * Math.PI * options.spinSpeed * (Date.now() - lastRender);
                    scope.controls.rotateLeft(theta);
                    scope.controls.update();
                }
            }
            this.dataUrl = function () {
                var dataUrl = renderer.domElement.toDataURL("image/png");
                return dataUrl;
            };
            this.stopSpin = function () {
                hasClicked = true;
            };
            this.options = function () {
                return options;
            };
            this.getModel = function () {
                return model;
            };
            this.getScene = function () {
                return scene;
            };
            this.getController = function () {
                return controller;
            };
            this.getCamera = function () {
                return camera;
            };
            this.needsUpdate = function () {
                needsUpdate = true;
            };
            function shouldRender() {
                // Do we need to draw a new frame
                if (scope.controls.needsUpdate || controller.needsUpdate || needsUpdate || model.scene.needsUpdate) {
                    scope.controls.needsUpdate = false;
                    controller.needsUpdate = false;
                    needsUpdate = false;
                    model.scene.needsUpdate = false;
                    return true;
                }
                else {
                    return false;
                }
            }
            function render() {
                if (!foreignRenderer) {
                    spin();
                    if (shouldRender()) {
                        renderer.clear();
                        renderer.render(scene.getScene(), camera);
                        renderer.clearDepth();
                        renderer.render(hud.getScene(), camera);
                    }
                    lastRender = Date.now();
                }
                ;
            }
            function animate() {
                var delay = 50;
                setTimeout(function () {
                    requestAnimationFrame(animate);
                }, delay);
                render();
            }
            ;
            this.rotatePressed = function () {
                controller.rotatePressed();
            };
            this.rotateReleased = function () {
                controller.rotateReleased();
            };
            this.setCursorStyle = function (cursorStyle) {
                domElement.style.cursor = cursorStyle;
            };
            this.updateWindowSize = function () {
                scope.heightMargin = scope.element.offset().top;
                scope.widthMargin = scope.element.offset().left;
                scope.elementWidth = scope.element.innerWidth();
                if (options.resize) {
                    scope.elementHeight = window.innerHeight - scope.heightMargin;
                }
                else {
                    scope.elementHeight = scope.element.innerHeight();
                }
                camera.aspect = scope.elementWidth / scope.elementHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(scope.elementWidth, scope.elementHeight);
                needsUpdate = true;
            };
            this.centerCamera = function () {
                var yOffset = 150.0;
                var pan = model.floorplan.getCenter();
                pan.y = yOffset;
                scope.controls.target = pan;
                var distance = model.floorplan.getSize().z * 1.5;
                var offset = pan.clone().add(new THREE.Vector3(0, distance, distance));
                //scope.controls.setOffset(offset);
                camera.position.copy(offset);
                scope.controls.update();
            };
            // projects the object's center point into x,y screen coords
            // x,y are relative to top left corner of viewer
            this.projectVector = function (vec3, ignoreMargin) {
                ignoreMargin = ignoreMargin || false;
                var widthHalf = scope.elementWidth / 2;
                var heightHalf = scope.elementHeight / 2;
                var vector = new THREE.Vector3();
                vector.copy(vec3);
                vector.project(camera);
                var vec2 = new THREE.Vector2();
                vec2.x = (vector.x * widthHalf) + widthHalf;
                vec2.y = -(vector.y * heightHalf) + heightHalf;
                if (!ignoreMargin) {
                    vec2.x += scope.widthMargin;
                    vec2.y += scope.heightMargin;
                }
                return vec2;
            };
            init();
        };
    })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/// <reference path="model/model.ts" />
/// <reference path="floorplanner/floorplanner.ts" />
/// <reference path="three/main.ts" />
var BP3D;
(function (BP3D) {
    /** Blueprint3D core application. */
    var Blueprint3d = (function () {
        /** Creates an instance.
         * @param options The initialization options.
         */
        function Blueprint3d(options) {
            this.model = new BP3D.Model.Model(options.textureDir);
            this.three = new BP3D.Three.Main(this.model, options.threeElement, options.threeCanvasElement, {}, options.alreadyRenderer, options.alreadyScene);
            if (!options.widget) {
                this.floorplanner = new BP3D.Floorplanner.Floorplanner(options.floorplannerElement, this.model.floorplan);
            }
            else {
                this.three.getController().enabled = false;
            }
        }
        return Blueprint3d;
    })();
    BP3D.Blueprint3d = Blueprint3d;
})(BP3D || (BP3D = {}));
var BP3D;
(function (BP3D) {
    var Core;
    (function (Core) {
        /** Enumeration of log contexts. */
        (function (ELogContext) {
            /** Log nothing. */
            ELogContext[ELogContext["None"] = 0] = "None";
            /** Log all. */
            ELogContext[ELogContext["All"] = 1] = "All";
            /** 2D interaction */
            ELogContext[ELogContext["Interaction2d"] = 2] = "Interaction2d";
            /** Interior items */
            ELogContext[ELogContext["Item"] = 3] = "Item";
            /** Wall (connectivity) */
            ELogContext[ELogContext["Wall"] = 4] = "Wall";
            /** Room(s) */
            ELogContext[ELogContext["Room"] = 5] = "Room";
        })(Core.ELogContext || (Core.ELogContext = {}));
        var ELogContext = Core.ELogContext;
        /** Enumeration of log levels. */
        (function (ELogLevel) {
            /** An information. */
            ELogLevel[ELogLevel["Information"] = 0] = "Information";
            /** A warning. */
            ELogLevel[ELogLevel["Warning"] = 1] = "Warning";
            /** An error. */
            ELogLevel[ELogLevel["Error"] = 2] = "Error";
            /** A fatal error. */
            ELogLevel[ELogLevel["Fatal"] = 3] = "Fatal";
            /** A debug message. */
            ELogLevel[ELogLevel["Debug"] = 4] = "Debug";
        })(Core.ELogLevel || (Core.ELogLevel = {}));
        var ELogLevel = Core.ELogLevel;
        /** The current log context. To be set when initializing the Application. */
        Core.logContext = ELogContext.None;
        /** Pre-check if logging for specified context and/or level is enabled.
         * This may be used to avoid compilation of complex logs.
         * @param context The log context to be verified.
         * @param level The log level to be verified.
         * @returns If this context/levels is currently logged.
         */
        function isLogging(context, level) {
            return Core.logContext === ELogContext.All || Core.logContext == context
                || level === ELogLevel.Warning || level === ELogLevel.Error
                || level === ELogLevel.Fatal;
        }
        Core.isLogging = isLogging;
        /** Log the passed message in the context and with given level.
         * @param context The context in which the message should be logged.
         * @param level The level of the message.
         * @param message The messages to be logged.
         */
        function log(context, level, message) {
            if (isLogging(context, level) === false) {
                return;
            }
            var tPrefix = "";
            switch (level) {
                case ELogLevel.Information:
                    tPrefix = "[INFO_] ";
                    break;
                case ELogLevel.Warning:
                    tPrefix = "[WARNG] ";
                    break;
                case ELogLevel.Error:
                    tPrefix = "[ERROR] ";
                    break;
                case ELogLevel.Fatal:
                    tPrefix = "[FATAL] ";
                    break;
                case ELogLevel.Debug:
                    tPrefix = "[DEBUG] ";
                    break;
            }
            console.log(tPrefix + message);
        }
        Core.log = log;
    })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
var BP3D;
(function (BP3D) {
    var Core;
    (function (Core) {
        /** Version information. */
        var Version = (function () {
            function Version() {
            }
            /** The informal version. */
            Version.getInformalVersion = function () {
                return "1.0 Beta 1";
            };
            /** The technical version. */
            Version.getTechnicalVersion = function () {
                return "1.0.0.1";
            };
            return Version;
        })();
        Core.Version = Version;
    })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
console.log("Blueprint3D " + BP3D.Core.Version.getInformalVersion()
    + " (" + BP3D.Core.Version.getTechnicalVersion() + ")");
//# sourceMappingURL=blueprint3d.js.map