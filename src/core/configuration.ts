/// <reference path="dimensioning.ts" />

module BP3D.Core {
  // FLOORPLANNER:

  /** Floorplanner: The dimensioning unit for 2D floorplan measurements. */
  export const configDimUnit = "dimUnit";

  /** Floorplanner: The grid spacing in Pixels. */
  export const configGridSpacing = "gridSpacing";

  /** Floorplanner: The grid width in Pixels. */
  export const configGridWidth = "gridWidth";

  /** Floorplanner: The color of the grid. */
  export const configGridColor = "gridColor";

  /** Floorplanner: The color of the room. */
  export const configRoomColor = "roomColor";

  /** Floorplanner: The wall width in Pixels. */
  export const configWallWidth = "wallWidth";

  /** Floorplanner: The wall width (hover mode) in Pixels. */
  export const configWallWidthHover = "wallWidthHover";

  /** Floorplanner: The wall color. */
  export const configWallColor = "wallColor";

  /** Floorplanner: The wall color (hover mode). */
  export const configWallColorHover = "wallColorHover";

  /** Floorplanner: The edge width in Pixels. */
  export const configEdgeWidth = "edgeWidth";

  /** Floorplanner: The edge color. */
  export const configEdgeColor = "edgeColor";

  /** Floorplanner: The edge color (hover mode). */
  export const configEdgeColorHover = "edgeColorHover";

  /** Floorplanner: The color in delete mode. */
  export const configDeleteColor = "deleteColor";

  /** Floorplanner: The corner radius in Pixels. */
  export const configCornerRadius = "cornerRadius";

  /** Floorplanner: The corner radius (Hover mode) in Pixels. */
  export const configCornerRadiusHover = "cornerRadiusHover";

  /** Floorplanner: The corner color. */
  export const configCornerColor = "cornerColor";

  /** Floorplanner: The corner color (hover mode). */
  export const configCornerColorHover = "cornerColorHover";

  // WALL:

  /** Wall: The initial wall height in cm. */
  export const configWallHeight = "wallHeight";

  /** Wall: The initial wall thickness in cm. */
  export const configWallThickness = "wallThickness";

  /** Global configuration to customize the whole system.  */
  export class Configuration {
    /** Configuration data loaded from/stored to extern. */
    private static data: {[key: string]: any} = {
      dimUnit: dimInch,
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

    /** Set a configuration parameter. */
    public static setValue(key: string, value: string | number) {
      this.data[key] = value;
    }

    /** Get a string configuration parameter. */
    public static getStringValue(key: string): string {
      switch (key) {
        case configDimUnit:
        case configGridColor:
        case configRoomColor:
        case configWallColor:
        case configWallColorHover:
        case configEdgeColor:
        case configEdgeColorHover:
        case configDeleteColor:
        case configCornerColor:
        case configCornerColorHover:
          return <string>this.data[key];
        default:
          throw new Error("Invalid string configuration parameter: " + key);
      }
    }

    /** Get a numeric configuration parameter. */
    public static getNumericValue(key: string): number {
      switch (key) {
        case configGridSpacing:
        case configGridWidth:
        case configWallWidth:
        case configWallWidthHover:
        case configEdgeWidth:
        case configCornerRadius:
        case configCornerRadiusHover:
        case configWallHeight:
        case configWallThickness:
          return <number>this.data[key];
        default:
          throw new Error("Invalid numeric configuration parameter: " + key);
      }
    }
  }
}