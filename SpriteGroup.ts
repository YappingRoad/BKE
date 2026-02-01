import Drawable from "./interfaces/Drawable";
import { PreloadAsset } from "./interfaces/PreloadRequestable";
import ComplexSprite from "./objects/sprites/ComplexSprite";
import { Sprite } from "./Sprite";
import State from "./State";

export class TypedSpriteGroup<T extends Sprite> extends ComplexSprite implements Drawable {
    members: Array<T>;

    constructor() {
        super();
        this.members = [];
    }

    public add(sprite: T) {
        this.members.push(sprite);
        sprite.index = this.members.indexOf(sprite);
    }

    public remove(sprite: T) {
        let i = this.members.indexOf(sprite);
        if (i != -1) {
            this.members.splice(i, 1);
        }
    }
    
    public override preload(): Array<PreloadAsset> {
        let assets: Array<PreloadAsset> = [];
        for (const member of this.members) {
            let memberAssets = member.preload();
            for (const asset of memberAssets) {
                if (!assets.includes(asset)) {
                    assets.push(asset);
                }
            }
        }
        return assets;
    }

    public override postPreload(): void {
        for (const member of this.members) {
            member.postPreload();
        }
    }

    public override draw() {
        let drawables: Array<Drawable> = [];
        for (const member of this.members) {
            if (State.isDrawable(member)) {
                drawables.push(member);
            }
        }

        drawables.sort((a, b) => {
            return a.index - b.index;
        })

        for (const drawable of drawables) {
            drawable.draw();
        }
        super.draw();
    }

    public override update(elapsed: number) {
        for (const member of this.members) {
            member.update(elapsed);
        }
        super.update(elapsed);
    }

    public override destroy(): void {
        for (const member of this.members) {
            member.destroy();
        }
        this.members = [];
    }
}

export default class SpriteGroup extends TypedSpriteGroup<Sprite> { }

export class ComplexSpriteGroup extends TypedSpriteGroup<ComplexSprite> { }
