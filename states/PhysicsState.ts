import { GameObject } from "../objects/GameObject";
import Line from "../math/Line";
import Rectangle from "../math/Rectangle";
import SpriteGroup from "../SpriteGroup";
import State from "../State";
import MathUtil, { RectangleSides } from "../utilities/MathUtil";
import SpriteUtil from "../utilities/SpriteUtil";
import Physics from "../math/Physics";
import PhysicsReactable, { CollideType, PhysicsReactableType } from "../interfaces/PhysicsReactable";
import BKE from "../BKE";

export default class PhysicsState extends State {
    phys: Array<PhysicsReactable> = [];
    constructor() {
        super();
    }
    public override add(member: GameObject) {
        if (PhysicsState.isPhysicsReactable(member)) {
            this.phys.push(member);
        }

        if (PhysicsState.isSpriteGroup(member)) {
            for (const submember of member.members) {
                if (PhysicsState.isPhysicsReactable(submember)) {
                    this.phys.push(submember);
                }
            }
        }
        super.add(member);
    }

    UPDATE_STATE_PHYSICS: boolean = true;
    public override update(elapsed: number) {
        if (BKE.physUpdateFrame && this.UPDATE_STATE_PHYSICS) {
            for (let k = 0; k < this.phys.length; k++) {
                const a = this.phys[k];
                const type = a.getPhysData().TYPE.value;


                // TODO: Implement this in a way that doesnt freeze shit in mid air
                // a.physSleeping = Math.round(Math.abs(a.keyframe.speed)) < 0.001 && 1 > Math.round(Math.abs(a.keyframe.gravity));
                // a.physSleeping = type === PhysicsReactableType.PARTICLES && Math.round(Math.abs(a.keyframe.speed)) < 0.001 && 1 > Math.round(Math.abs(a.keyframe.gravity));
                if (!a.physSleeping) {
                    for (let i = 0; i < BKE.physFramesToUpdate; i++) {
                        a.updatePhysics();
                    }
                }
                else {
                    continue;
                }



                if (a.keyframe.y + a.getPhysRect().height > Physics.DATA.FLOOR_Y) {
                    a.collision({ type: CollideType.FLOOR, object: null, position: { x: 0, y: Physics.DATA.FLOOR_Y } });
                }
                else if (Physics.DATA.CEILING_Y >= a.keyframe.y) {
                    a.collision({ type: CollideType.CEILING, object: null, position: { x: 0, y: Physics.DATA.CEILING_Y } });
                }

                if (Physics.DATA.LEFT_WALL_X >= a.keyframe.x) {
                    a.collision({ type: CollideType.LEFT_WALL, object: null, position: { x: Physics.DATA.LEFT_WALL_X, y: 0 } });
                } else if (a.keyframe.x + a.getPhysRect().width >= Physics.DATA.RIGHT_WALL_X) {
                    a.collision({ type: CollideType.RIGHT_WALL, object: null, position: { x: Physics.DATA.RIGHT_WALL_X, y: 0 } });
                }


                if (type === PhysicsReactableType.PARTICLES) {
                    continue;
                }

                let collisions = 0;
                let avg = 0;
                let avgmem = 0;
                for (let j = 0; j < this.phys.length; j++) {
                    const b = this.phys[j];
                    if (b.keyframe === a.keyframe) {
                        continue;
                    }


                    // if (MathUtil.getRandomBool()) {
                    //     break;
                    // }


                    // avg += SpriteUtil.distanceToPoint(a.getPhysRect(), b.getPhysRect());
                    // avgmem++;
                    // if ((avg/avgmem) > 300 && avgmem > 32) {
                    //     break;
                    // }

                    if (PhysicsState.checkPhys(a, b)) {
                        collisions++;
                    }

                    // if (collisions > 1 && MathUtil.getRandomBool()) {
                    //     break;
                    // }

                    // PhysicsState.checkPhys(b, a);
                }


                a.postUpdatePhysics()


            }
        }

        super.update(elapsed);
    }

    static checkPhys(a: PhysicsReactable, b: PhysicsReactable): boolean {

        // return false;
        let aData = a.getPhysData();
        let bData = b.getPhysData();

        if (aData.TYPE.value === PhysicsReactableType.NON_COLLIDABLE || bData.TYPE.value === PhysicsReactableType.NON_COLLIDABLE
            || aData.TYPE.value === PhysicsReactableType.PARTICLES || bData.TYPE.value === PhysicsReactableType.PARTICLES) {
            return false;
        }



        if (aData.TYPE.value === PhysicsReactableType.HEAVY_OBJECTS && bData.TYPE.value === PhysicsReactableType.LIGHT_OBJECTS) {
            return false;
        }


        // if (aData.TYPE.value === PhysicsReactableType.LIGHT_OBJECTS && bData.TYPE.value === PhysicsReactableType.LIGHT_OBJECTS) {
        //     return false;
        // }
        let aRect = a.getPhysRect();
        let bRect = b.getPhysRect();


        if (!MathUtil.rectsOverlap(aRect, bRect)) {
            return false;
        }


        // if (SpriteUtil.distanceToPoint(Rectangle.getCenterPoint(aRect), Rectangle.getCenterPoint(bRect)) > (bRect.width + bRect.height) / 2) {
        //     return;
        // }

        let aLines = MathUtil.getRectangleSides(aRect);

        let bLines = MathUtil.getRectangleSides(bRect);
        let floorDistance = SpriteUtil.distanceToPointRaw(bLines.top.midpoint, aLines.bottom.midpoint);
        let ceilingDistance = SpriteUtil.distanceToPointRaw(bLines.bottom.midpoint, aLines.top.midpoint);

        let leftDistance = SpriteUtil.distanceToPointRaw(bLines.left.midpoint, aLines.right.midpoint);
        let rightDistance = SpriteUtil.distanceToPointRaw(bLines.right.midpoint, aLines.left.midpoint);

        let min = Math.min(floorDistance, ceilingDistance, leftDistance, rightDistance);
        if (min === ceilingDistance && aLines.top.y1 < bLines.bottom.y1) {
            a.collision({ type: CollideType.CEILING, object: b, position: { x: 0, y: bLines.bottom.y1 } });
        }
        else if (min === floorDistance && aLines.bottom.y1 > bLines.top.y1) {
            a.collision({ type: CollideType.FLOOR, object: b, position: { x: 0, y: bLines.top.y1 } });
        }

        else if (min === rightDistance && aLines.left.x1 < bLines.right.x1) {
            a.collision({ type: CollideType.LEFT_WALL, object: b, position: { x: bLines.right.x1, y: 0 } });
        }
        else if (min === leftDistance && aLines.right.x1 > bLines.left.x1) {
            a.collision({ type: CollideType.RIGHT_WALL, object: b, position: { x: bLines.left.x1, y: 0 } });
        }
        if (b.physSleeping) {
            b.updatePhysics();
        }
        return true;

        // // if they still overlap just fling it out atp
        // if (MathUtil.rectsOverlap(aRect, bRect) && (min === leftDistance || min === rightDistance)) {

        //     a.keyframe.speed += a.keyframe.speed > 0 ? 0.1 : -0.1;
        //     a.keyframe.speed *= 1.1;
        //     // a.keyframe.gravity += a.keyframe.gravity > 0 ? 0.1 : -0.1;
        //     // a.keyframe.gravity *= 1.1;
        // }

        // just in case speed cap



    }

    // Unused but is better if it would work 
    static altCheckPhys(a: PhysicsReactable, b: PhysicsReactable) {
        let aData = a.getPhysData();
        let bData = b.getPhysData();

        if (aData.TYPE.value === PhysicsReactableType.NON_COLLIDABLE || bData.TYPE.value === PhysicsReactableType.NON_COLLIDABLE) {
            return;
        }



        if (aData.TYPE.value === PhysicsReactableType.HEAVY_OBJECTS && bData.TYPE.value === PhysicsReactableType.LIGHT_OBJECTS) {
            return;
        }


        let aRect = a.getPhysRect();
        let bRect = b.getPhysRect();

        if (!MathUtil.rectsOverlap(aRect, bRect)) {
            return;
        }
        let aPrev = a.lastKeyframe;
        let aCur = a.keyframe;

        let bPrev = b.keyframe;

        let bCur = b.keyframe;

        let aSize = a.getPhysSize();
        let bSize = b.getPhysSize();


        // note: NOT Delta Airlines
        let deltaLines: Array<Line> = [];


        // Top Left
        let tl = new Line(aPrev.x, aPrev.y, aCur.x, aCur.y);

        // Top Left Middle
        let tlm = new Line(aPrev.x + (aSize.x * 0.25), aPrev.y, aCur.x + (aSize.x * 0.25), aCur.y);

        // Top Middle
        let tm = new Line(aPrev.x + (aSize.x * 0.5), aPrev.y, aCur.x + (aSize.x * 0.5), aCur.y);

        // Top Right Middle
        let trm = new Line(aPrev.x + (aSize.x * 0.75), aPrev.y, aCur.x + (aSize.x * 0.75), aCur.y);

        // Top Right
        let tr = new Line(aPrev.x + aSize.x, aPrev.y, aCur.x + aSize.x, aCur.y);

        // Bottom Left
        let bl = new Line(aPrev.x, aPrev.y + aSize.y, aCur.x, aCur.y + aSize.y);

        // Bottom Left Middle
        let blm = new Line(aPrev.x + (aSize.x * 0.25), aPrev.y + aSize.y, aCur.x + (aSize.x * 0.25), aCur.y + aSize.y);

        // Bottom Middle
        let bm = new Line(aPrev.x + (aSize.x * 0.5), aPrev.y + aSize.y, aCur.x + (aSize.x * 0.5), aCur.y + aSize.y);

        // Bottom Right Middle
        let brm = new Line(aPrev.x + (aSize.x * 0.75), aPrev.y + aSize.y, aCur.x + (aSize.x * 0.75), aCur.y + aSize.y);

        // Bottom Right
        let br = new Line(aPrev.x + aSize.x, aPrev.y + aSize.y, aCur.x + aSize.x, aCur.y + aSize.y);


        // Left Top Middle
        let ltm = new Line(aPrev.x, aPrev.y + (aSize.y * 0.25), aCur.x, aCur.y + (aSize.y * 0.25));

        // Left Middle
        let lm = new Line(aPrev.x, aPrev.y + (aSize.y * 0.5), aCur.x, aCur.y + (aSize.y * 0.5));

        // Left Bottom Middle
        let lbm = new Line(aPrev.x, aPrev.y + (aSize.y * 0.75), aCur.x, aCur.y + (aSize.y * 0.75));


        // Right Top Middle
        let rtm = new Line(aPrev.x + aSize.x, aPrev.y + (aSize.y * 0.25), aCur.x + aSize.x, aCur.y + (aSize.y * 0.25));

        // Right Middle
        let rm = new Line(aPrev.x + aSize.x, aPrev.y + (aSize.y * 0.5), aCur.x + aSize.x, aCur.y + (aSize.y * 0.5));

        // Right Bottom Middle
        let rbm = new Line(aPrev.x + aSize.x, aPrev.y + (aSize.y * 0.75), aCur.x + aSize.x, aCur.y + (aSize.y * 0.75));

        let aLines = MathUtil.getRectangleSides(aRect);

        let bLines = MathUtil.getRectangleSides(bRect);
        // horizontally in bounds


        let curOnRightSide = aCur.x + aSize.x > bCur.x + bSize.x && aCur.x > bCur.x;
        let prevOnRightSide = aPrev.x + aSize.x > bPrev.x + bSize.x && bPrev.x > bCur.x;


        let ceilingColliding = PhysicsState.getCollisions([tl, tlm, tm, trm, tr], bLines).includes(CollideType.CEILING);
        let floorColliding = PhysicsState.getCollisions([bl, blm, bm, brm, br], bLines).includes(CollideType.FLOOR);
        let rightWallColliding = PhysicsState.getCollisions([tr, rtm, rm, rbm, br], bLines).includes(CollideType.RIGHT_WALL);
        let leftWallColliding = PhysicsState.getCollisions([tl, ltm, lm, lbm, bl], bLines).includes(CollideType.LEFT_WALL);



        if (floorColliding) {
            a.collision({ type: CollideType.FLOOR, object: b, position: { x: 0, y: bLines.top.y1 } });
        }

        if (ceilingColliding) {
            a.collision({ type: CollideType.CEILING, object: b, position: { x: 0, y: bLines.bottom.y1 } });
        }


        if (rightWallColliding) {
            a.collision({ type: CollideType.RIGHT_WALL, object: b, position: { x: bLines.left.x1, y: 0 } });
        }

        if (leftWallColliding) {
            a.collision({ type: CollideType.LEFT_WALL, object: b, position: { x: bLines.right.x1, y: 0 } });
        }
    }

    static getCollisions(lines: Array<Line>, collider: RectangleSides): Array<CollideType> {
        let collisions: Set<CollideType> = new Set();
        for (const line of lines) {
            if (MathUtil.intersect(line, collider.bottom)) {
                collisions.add(CollideType.CEILING);
            }
            if (MathUtil.intersect(line, collider.top)) {
                collisions.add(CollideType.FLOOR);
            }

            if (MathUtil.intersect(line, collider.left)) {
                collisions.add(CollideType.RIGHT_WALL);
            }
            if (MathUtil.intersect(line, collider.right)) {
                collisions.add(CollideType.LEFT_WALL);
            }
        }
        return new Array<CollideType>(...(collisions.values()));
    }


    override memberUpdate(elapsed: number, member: GameObject) {
        super.memberUpdate(elapsed, member);
    }

    static isPhysicsReactable(member: GameObject): member is PhysicsReactable {
        return (member as PhysicsReactable).getPhysRect !== undefined;
    }

    static isSpriteGroup(member: GameObject): member is SpriteGroup {
        return (member as SpriteGroup).add !== undefined;
    }
}