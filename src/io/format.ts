module BP3D.IO {

  /**
   * Master container for exchange files.
   * File extension is .blueprint3d
   */
  export interface IFormat {
    /** The floorplan. */
    floorplan: IFloorPlan;

    /** The items. */
    items: IItem[];
  }

  /** Structured floorplan. */
  export interface IFloorPlan {
    /** The corners. */
    corners: { [uid: string]: ICornerPos2D; };

    /** The walls. */
    walls: IWall[];

    /** The wall textures. */
    wallTextures: any[];

    /** The floor textures. */
    floorTextures: any[];

    /** Comma separated, alphabetically sorted list of corner uids, just concatenated. */
    newFloorTextures: { [floorDesc: string]: INewFloorTexture; };
  }

  /**  */
  export interface INewFloorTexture {
    /**  absolute or relative image url, JPEG or PNG. */
    url: string;

    /** */
    scale: number;
  }

  /** 2D corner position. */
  export interface ICornerPos2D {
    /** x (also 3D) in cm */
    x: number;

    /** y (z in 3D) in cm */
    y: number;
  }

  /** Wall representation. */
  export interface IWall {
    /** Corner uid. */
    corner1: string;

    /** Corner uid. */
    corner2: string;

    /** Front texture. */
    frontTexture: ITexture;

    /** Back texture. */
    backTexture: ITexture;

    /** Height in cm, optional. */
    height?: number;
  }

  /** Texture definition. */
  export interface ITexture {
    /** Link, possibly relative, to png or jpg file. */
    url: string;

    /** To be stretched or not, That's the Question! */
    stretch: boolean;

    /** Scaling. */
    scale: number;
  }

  /** Item representation. */
  export interface IItem {
    /** Name of the item, to be shown in property editor if object is selected, for instance. */
    item_name: string;

    /** */
    item_type: number;

    /** Referencing a JS file? */
    model_url: string;

    /** X position, cm */
    xpos: number;

    /** Y position, cm */
    ypos: number;

    /** Z position, cm */
    zpos: number;

    /** Y rotation, rad, CCW. */
    rotation: number;

    /** Width factor, default: 1. To be applied on the default width. */
    scale_x: number;

    /** Height factor, default: 1.  To be applied on the default height. */
    scale_y: number;

    /** Depth factor, default: 1.  To be applied on the default depth. */
    scale_z: number;

    /** Lock state as managed by the property editor. */
    fixed: boolean;

    /** Resizeable in the property editor? */
    resizable?: boolean;
  }
}