//own module to prevent name clashes
module BP3D.SaveFormat {

	// have a reference definition for save format, file ending is     .blueprint3d
	export interface ISaveFormat {
		floorplan: IFloorPlan;
		items: IItem[];
	}

	export interface IFloorPlan {
		corners: { [corneruid: string]: ICornerPos2D; };
		walls: IWall[];
		wallTextures: any[];    // ?
		floorTextures: any;     // ?
		newFloorTextures: any;  // ?
	}

	export interface ICornerPos2D {
		x: number; //cm  // N.B. this can be used as x in 3D
		y: number; //cm  // N.B. this would be something like z in 3D, so it is not a height by any means
	}

	export interface IWall {
		corner1: string; //corneruid
		corner2: string; //corneruid
		frontTexture: ITexture;
		backTexture: ITexture; 
		height?: number;          // optional, cm, added to save height independant from global configuration
	}

	export interface ITexture {
		url: string; // link, possibly relative to png or jpg file
		stretch: boolean; // ?
		scale: number; // ?
	}


	export interface IItem {
		item_name: string;  // plain name shown in left property editor if object is selected
		item_type: number;  // ?
		model_url: string;  // ? referencing a javascript file
		xpos: number;       // cm 
		ypos: number;       // cm
		zpos: number;       //
		rotation: number;   // only y Rotation is supported, 1.57 turns 90 degrees counterclockwise
		scale_x: number;    // width factor, default 1,  see next line for details
		scale_y: number;    // height factor, default 1, if left property editor changes value, this is changed (e.g. normal height 20, changed to 30 -> this entry if saved will be 1.5)
		scale_z: number;    // depth factor, default 1, see above
		fixed: boolean;        //whether object can be moved with mouse, "Lock in place" in left property editor
		resizable?: boolean;  // can be resized by property editor? (not yet encountered in the wild ?!)
	}
}