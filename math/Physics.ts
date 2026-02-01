import Rectangle from "./Rectangle";

export default class Physics {
    public static readonly DEFAULTS: PhysicsData = {
        GRAVITY: 0.981,
        AIR_RESISTANCE: 0.895,
        FLOOR_ENERGY_TRANSFER: 0.8,
        WALL_BOUNCE_MULTIPLIER: 1.1,
        LEFT_WALL_X: 80.0,
        RIGHT_WALL_X: 560.0,
        CEILING_Y: 4.0,
        FLOOR_Y: 295.0,
        CEILING_REBOUNDS: true,
    };
    public static DATA: PhysicsData = {
        GRAVITY: 0.981,
        AIR_RESISTANCE: 0.895,
        FLOOR_ENERGY_TRANSFER: 0.8,
        WALL_BOUNCE_MULTIPLIER: 1.1,
        LEFT_WALL_X: 80.0,
        RIGHT_WALL_X: 560.0,
        CEILING_Y: 4.0,
        FLOOR_Y: 295.0,
        CEILING_REBOUNDS: true,
    };

    public static getRect(): Rectangle {
        return { x: Physics.DATA.LEFT_WALL_X, y: Physics.DATA.CEILING_Y, width: Physics.DATA.RIGHT_WALL_X - Physics.DATA.LEFT_WALL_X, height: Physics.DATA.FLOOR_Y - Physics.DATA.CEILING_Y }
    }

    public static resetToDefault(): void {
        Physics.DATA = {
            GRAVITY: Physics.DEFAULTS.GRAVITY,
            AIR_RESISTANCE: Physics.DEFAULTS.AIR_RESISTANCE,
            FLOOR_ENERGY_TRANSFER: Physics.DEFAULTS.FLOOR_ENERGY_TRANSFER,
            WALL_BOUNCE_MULTIPLIER: Physics.DEFAULTS.WALL_BOUNCE_MULTIPLIER,
            LEFT_WALL_X: Physics.DEFAULTS.LEFT_WALL_X,
            RIGHT_WALL_X: Physics.DEFAULTS.RIGHT_WALL_X,
            CEILING_Y: Physics.DEFAULTS.CEILING_Y,
            FLOOR_Y: Physics.DEFAULTS.FLOOR_Y,
            CEILING_REBOUNDS: Physics.DEFAULTS.CEILING_REBOUNDS,
        }
    }
}

export interface PhysicsData {
    // multipliers
    GRAVITY: number,
    AIR_RESISTANCE: number,
    FLOOR_ENERGY_TRANSFER: number,
    WALL_BOUNCE_MULTIPLIER: number,

    // Hardcoded Positions (kys)
    LEFT_WALL_X: number,
    RIGHT_WALL_X: number,
    CEILING_Y: number,
    FLOOR_Y: number,

    // Flags
    CEILING_REBOUNDS: boolean,
}