import Rectangle from "../math/Rectangle";
import Vector2 from "../math/Vector2";
import { NumberComponent, OptionComponent } from "../struct/Component";
import { IStructure, Structure, StructureObjects } from "../struct/Structure";

export default interface PhysicsReactable {
    lastKeyframe: PhysicsKeyframe;
    keyframe: PhysicsKeyframe;
    
    collision(event: PhysicsReactableCollideEvent): void;
    getPhysData(): PhysicsReactableData;
    getPhysRect(): Rectangle;
    getPhysSize(): Vector2;
    updatePhysics(): void;
    postUpdatePhysics(): void;
}

export interface PhysicsReactableCollideEvent {
    type: CollideType,
    position: Vector2,
    object: PhysicsReactable | null
}

export enum CollideType {
    LEFT_WALL,
    RIGHT_WALL,
    FLOOR,
    CEILING
}

export class PhysicsReactableData extends Structure implements IStructure {
    [name: string]: StructureObjects;
    create(): Structure {
        return new PhysicsReactableData()
    }
    TYPE: OptionComponent<PhysicsReactableType> = OptionComponent.of(
        {
            default: PhysicsReactableType.LIGHT_OBJECTS,
            options: [PhysicsReactableType.ENVIRONMENT, PhysicsReactableType.HEAVY_OBJECTS, PhysicsReactableType.LIGHT_OBJECTS, PhysicsReactableType.NON_COLLIDABLE]
        }
    );
    // if 1.0, it will infinitely bounce an object
    STRENGTH_FLOOR_BOUNCE: NumberComponent = NumberComponent.of(0.8);
    STRENGTH_LEFT_WALL_BOUNCE: NumberComponent = NumberComponent.of(0.8);
    STRENGTH_RIGHT_WALL_BOUNCE: NumberComponent = NumberComponent.of(0.8);
    STRENGTH_CEILING_BOUNCE: NumberComponent = NumberComponent.of(0.8);
    SIDES: NumberComponent = NumberComponent.of(0.8);
}


export enum PhysicsReactableType {
    // all physics types collide with this
    ENVIRONMENT,
    // Heavy objects collide with other heavy objects and influence each other
    HEAVY_OBJECTS,
    // Light objects collide with other light objects and influence each others speed
    // Light objects can collide with heavy objects but heavy objects do not collide with light objects
    LIGHT_OBJECTS,
    // Does not collide with anything but still has a hitbox for recieving events
    NON_COLLIDABLE
}

export interface PhysicsKeyframe {
    x: number,
    y: number,
    speed: number,
    angleSpin:number,
    gravity: number,
}