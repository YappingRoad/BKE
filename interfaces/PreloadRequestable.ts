import { Component, OptionComponent, StringComponent } from "../struct/Component";
import { Structure } from "../struct/Structure";

export default interface PreloadRequestable {
    preload(): Array<PreloadAsset>;
    postPreload(): void;
}

export interface PreloadAsset {
    path: string,
    type: PreloadAssetType,
    soundMode?: SoundMode,
    priority?: boolean,
    keepInMemory?: boolean
}


export class PreloadAssetStructure extends Structure {

    constructor(asset: PreloadAsset) {
        super()
        this.path = StringComponent.of(asset.path);
        this.type = OptionComponent.of({ default: asset.type, options: [PreloadAssetType.SOUND, PreloadAssetType.IMAGE, PreloadAssetType.TEXT] })
        this.soundMode = new Component(asset.soundMode);
        this.priority = new Component(asset.priority);
        this.keepInMemory = new Component(asset.keepInMemory);
    }

    static toInterface(struct:PreloadAssetStructure): PreloadAsset {
        return {
            path: struct.path.value,
            type: struct.type.value,
            soundMode: struct.soundMode.value,
            priority: struct.priority.value,
            keepInMemory: struct.keepInMemory.value
        }
    }

    static of(asset:PreloadAsset):PreloadAssetStructure {
        return new PreloadAssetStructure(asset);
    }


    path: StringComponent;
    type: OptionComponent<PreloadAssetType>;
    soundMode: Component<SoundMode | undefined>;
    priority: Component<boolean | undefined>;
    keepInMemory: Component<boolean | undefined>;
}

export enum PreloadAssetType {
    SOUND,
    IMAGE,
    TEXT
}

export enum SoundMode {
    DEFAULT,
    PANNER,
    STEREO_PANNER,
    MUSIC
}