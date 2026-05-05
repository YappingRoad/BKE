import { SoundMode, PreloadAsset, PreloadAssetType } from "../interfaces/PreloadRequestable";
import Callback from "../Callback";
import Electron from "../electron/Electron";
import Time from "../math/Time";
import Graphic from "../graphic/Graphic";
import Renderer from "../renderers/Renderer";
import BKE from "../BKE";
import PaletteUtil from "../utilities/PaletteUtil";
import Sample from "../audio/Sample";
import Platform from "../platform/Platform";
import PannerSound from "../audio/PannerSound";
import StereoPannerSound from "../audio/StereoPannerSound";
import MusicSound from "../audio/MusicSound";
import Sound from "../audio/Sound";

// todo update to new graphic class

export type AssetObject = Graphic | Sample | string;

export default class AssetLoader {

    static cacheQueue: Array<PreloadAsset> = [];
    static assets: Map<PreloadAsset, AssetObject> = new Map();
    static loadPercentage: Map<PreloadAsset, number> = new Map();

    static addToQueue(assets: Array<PreloadAsset>) {
        for (const member of assets) {
            if (!AssetLoader.cacheQueue.includes(member) && !AssetLoader.assets.has(member)) {
                AssetLoader.cacheQueue.push(member)
            }
        }
    }

    static totalLoading: number = 0;
    static totalCurrentlyLoading: number = 0;

    static onPreloadStart: Callback<void> = new Callback();

    static preloadStartTime: number;

    static onRemove: Callback<PreloadAsset> = new Callback();

    static getScore(asset: PreloadAsset): number {
        if (asset.priority) {
            return 0;
        }
        else if (asset.type === PreloadAssetType.SOUND) {
            return 1;
        }
        else if (asset.type === PreloadAssetType.IMAGE) {
            return 2;
        }
        else if (asset.type === PreloadAssetType.TEXT) {
            return 3;
        }
        return 4;
    }

    static preload(callback: VoidFunction) {
        AssetLoader.clearCache();
        AssetLoader.onPreloadStart.dispatch();
        AssetLoader.preloadStartTime = Time.getMS();
        AssetLoader.cacheQueue.sort((a, b) => {
            return AssetLoader.getScore(b) - AssetLoader.getScore(a);
        });
        AssetLoader.totalLoading = AssetLoader.cacheQueue.length;
        AssetLoader.totalCurrentlyLoading = AssetLoader.totalLoading;
        if (AssetLoader.totalLoading === 0) {
            // we have loaded everything
            callback();
            return;
        }
        for (const preloadAsset of AssetLoader.cacheQueue) {
            if (preloadAsset.type === PreloadAssetType.IMAGE) {
                AssetLoader.loadImage(preloadAsset, callback);
            }
            else if (preloadAsset.type === PreloadAssetType.SOUND) {
                AssetLoader.loadSample(preloadAsset, callback);
            }
            else if (preloadAsset.type === PreloadAssetType.TEXT) {
                AssetLoader.loadText(preloadAsset, callback);
            }
        }
    }

    public static loadImage(preloadAsset: PreloadAsset, callback: VoidFunction): Promise<void> {
        return new Promise<void>((resolve) => {
            AssetLoader.loadPercentage.set(preloadAsset, 0);

            const request = new XMLHttpRequest();
            const path = preloadAsset.path;
            request.open('GET', path, true);
            request.responseType = 'blob';
            request.onload = function () {
                const graphic = Renderer.CURRENT.createGraphic(request.response as Blob)

                const promise = graphic.load();
                promise.then(() => {
                    console.log(preloadAsset, PaletteUtil.asHexStrings(graphic.getColorPalette()))
                    AssetLoader.assets.set(preloadAsset, graphic);
                    AssetLoader.assetLoaded(preloadAsset, callback);
                    AssetLoader.loadPercentage.set(preloadAsset, 1.0);
                    resolve();
                });
                promise.catch(() => {
                    AssetLoader.assetNotLoaded(preloadAsset, callback);
                    resolve();
                })



            }
            request.onprogress = function (ev) {
                BKE.loadstatus = "Loading images...";
                AssetLoader.loadPercentage.set(preloadAsset, (ev.loaded / ev.total) * 0.75);
            }
            request.onerror = function () {
                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            }
            request.send();
        });
    }

    public static loadSample(preloadAsset: PreloadAsset, callback: VoidFunction): Promise<void> {
        return new Promise<void>((resolve) => {
            AssetLoader.loadPercentage.set(preloadAsset, 0);

            let request = new XMLHttpRequest();
            let path = preloadAsset.path;
            if (!Electron.isAvailable() && preloadAsset.soundMode != undefined && preloadAsset.soundMode === SoundMode.MUSIC) {
                path = path.replace(".wav", ".mp3");
            }
            request.open('GET', path, true);
            //webaudio paramaters
            request.responseType = 'arraybuffer';
            request.onload = function () {
                const sample = Platform.getCurrent().createSample(request.response);
                const promise = sample.load()
                promise.then(() => {
                    AssetLoader.assets.set(preloadAsset, sample);
                    AssetLoader.assetLoaded(preloadAsset, callback);
                    resolve();
                    AssetLoader.loadPercentage.set(preloadAsset, 1.0);
                }).catch(() => {
                    AssetLoader.assetNotLoaded(preloadAsset, callback);
                    resolve();
                })

            }
            request.onprogress = function (ev) {
                BKE.loadstatus = "Loading sounds...";
                AssetLoader.loadPercentage.set(preloadAsset, ev.loaded / ev.total);
            }
            request.onerror = function () {
                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            }
            request.send();
        });
    }

    public static getPercentageLoaded(): number {
        let total = 0;
        for (const percent of AssetLoader.loadPercentage.values()) {
            total += percent;
        }
        return total / AssetLoader.loadPercentage.size;
    }

    public static loadText(preloadAsset: PreloadAsset, callback: VoidFunction): Promise<void> {
        return new Promise<void>((resolve) => {
            AssetLoader.loadPercentage.set(preloadAsset, 0);
            let request = new XMLHttpRequest();
            let path = preloadAsset.path;
            request.open('GET', path, true);
            //webaudio paramaters
            request.responseType = 'text';
            request.onload = function () {
                AssetLoader.assets.set(preloadAsset, request.response as string);
                AssetLoader.assetLoaded(preloadAsset, callback);
                resolve();
                AssetLoader.loadPercentage.set(preloadAsset, 1.0);
            }
            request.onprogress = function (ev) {
                BKE.loadstatus = "Loading data...";
                AssetLoader.loadPercentage.set(preloadAsset, ev.loaded / ev.total);
            }
            request.onerror = function () {
                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            }
            request.send();
        });
    }



    private static assetNotLoaded(asset: PreloadAsset, callback: () => void) {
        console.warn("Asset not loaded!")
        console.log(asset);
        AssetLoader.assetLoaded(asset, callback);
    }

    private static assetLoaded(asset: PreloadAsset, callback: () => void) {
        AssetLoader.cacheQueue.splice(AssetLoader.cacheQueue.indexOf(asset), 1);
        AssetLoader.totalLoading = AssetLoader.cacheQueue.length;
        if (AssetLoader.totalLoading === 0) {
            // we have loaded everything
            callback();
        }
    }

    public static clearCache() {
        AssetLoader.loadPercentage.clear();
        // todo: make this function without breaking everything

        // let keysToRemove: Array<PreloadAsset> = [];
        // for (const entry of this.assets.entries()) {
        //     let asset = entry[0];
        //     let obj = entry[1];

        //     if (!asset.keepInMemory && AssetLoader.cacheQueue.indexOf(asset) === -1) {
        //         keysToRemove.push(asset);
        //     }
        // }
        // console.log(keysToRemove);
        // for (const key of keysToRemove) {
        //     this.onRemove.dispatch(key);
        //     this.assets.delete(key);
        // }
    }



    static exists(asset: PreloadAsset) {
        return AssetLoader.assets.has(asset);
    }

    static getGraphic(asset: PreloadAsset): Graphic {
        return (AssetLoader.assets.get(asset) as Graphic);
    }

    static getSample(asset: PreloadAsset): Sample {
        return (AssetLoader.assets.get(asset) as Sample);
    }


    static getSound(asset: PreloadAsset): Sound {
        const sample = AssetLoader.getSample(asset);
        const sound = Platform.getCurrent().getSound(sample);
        sound.create();
        return sound;
    }

    static getPannerSound(asset: PreloadAsset): PannerSound {
        const sample = AssetLoader.getSample(asset);
        const sound = Platform.getCurrent().getPannerSound(sample);
        sound.create();
        return sound;
    }

    static getStereoPannerSound(asset: PreloadAsset): StereoPannerSound {
        const sample = AssetLoader.getSample(asset);
        const sound = Platform.getCurrent().getStereoPannerSound(sample);
        sound.create();
        return sound;
    }

    static getMusicSound(asset: PreloadAsset): MusicSound {
        const sample = AssetLoader.getSample(asset);
        const sound = Platform.getCurrent().getMusicSound(sample);
        sound.create();
        return sound;
    }

    static getText(asset: PreloadAsset): string {
        return (AssetLoader.assets.get(asset) as string);
    }
}