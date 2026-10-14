import { SoundMode, PreloadAsset, PreloadAssetType } from "../interfaces/PreloadRequestable";
import Callback from "../Callback";
import Time from "../math/Time";
import Graphic from "../graphic/Graphic";
import Renderer from "../renderers/Renderer";
import BKE from "../BKE";
import Platform from "../platform/Platform";
import { IPannerSound } from "../audio/IPannerSound";
import { ISound } from "../audio/ISound";
import { IStereoPannerSound } from "../audio/IStereoPannerSound";
import { IMusicSound } from "../audio/IMusicSound";

// todo update to new graphic class

export type AssetObject = Graphic | ISound | string;

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
                AssetLoader.loadSound(preloadAsset, callback);
            }
            else if (preloadAsset.type === PreloadAssetType.TEXT) {
                AssetLoader.loadText(preloadAsset, callback);
            }
        }
    }

    public static loadImage(preloadAsset: PreloadAsset, callback: VoidFunction): Promise<void> {
        return new Promise<void>((resolve) => {
            AssetLoader.loadPercentage.set(preloadAsset, 0);
            AssetLoader.loadPercentage.set(preloadAsset, 0);
            BKE.loadstatus = "Loading images...";
            AssetLoader.loadPercentage.set(preloadAsset, 0.0);
            console.log("ASSETLOADER: Loading " + preloadAsset.path)
            const path = preloadAsset.path;
            Platform.getCurrent().loadPathAsBlob(path).then((blob) => {
                console.log("HIIII IVE LOADED")
                const graphic = Renderer.CURRENT.createGraphic(blob)
                const promise = graphic.load();
                promise.then(() => {

                    AssetLoader.assets.set(preloadAsset, graphic);
                    AssetLoader.assetLoaded(preloadAsset, callback);
                    AssetLoader.loadPercentage.set(preloadAsset, 1.0);
                    resolve();
                });
                promise.catch((err) => {
                    console.log(err)
                    AssetLoader.assetNotLoaded(preloadAsset, callback);
                    resolve();
                })

            }).catch((err) => {
                console.log(err)

                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            })
        });
    }

    public static loadSound(preloadAsset: PreloadAsset, callback: VoidFunction): Promise<void> {
        return new Promise<void>((resolve) => {
            BKE.loadstatus = "Loading sounds...";
            AssetLoader.loadPercentage.set(preloadAsset, 0.0);


            let path = preloadAsset.path;
            // if (!(Platform.getCurrent().getPlatformDetails().includes("electron")) && preloadAsset.soundMode != undefined && preloadAsset.soundMode === SoundMode.MUSIC) {
            //     path = path.replace(".wav", ".mp3");
            // }
            console.log("ASSETLOADER: Loading " + preloadAsset.path)

            Platform.getCurrent().loadPathAsArrayBuffer(path).then((response) => {
                // AssetLoader.assets.set(preloadAsset, "");
                // AssetLoader.assetLoaded(preloadAsset, callback);
                // AssetLoader.loadPercentage.set(preloadAsset, 1.0);
                let promise: Promise<ISound>;
                if (preloadAsset.soundMode === SoundMode.PANNER) {
                    promise = Platform.getCurrent().loadPannerSound(response);
                }
                else if (preloadAsset.soundMode === SoundMode.STEREO_PANNER) {
                    promise = Platform.getCurrent().loadStereoPannerSound(response);
                }
                else if (preloadAsset.soundMode === SoundMode.MUSIC) {
                    promise = Platform.getCurrent().loadMusicSound(response);
                }
                else {
                    promise = Platform.getCurrent().loadSound(response);
                }

                promise.then((sound) => {
                    sound.create();
                    AssetLoader.assets.set(preloadAsset, sound);
                    AssetLoader.assetLoaded(preloadAsset, callback);
                    resolve();
                    AssetLoader.loadPercentage.set(preloadAsset, 1.0);
                }).catch((err) => {
                    console.log(err)
                    AssetLoader.assetNotLoaded(preloadAsset, callback);
                    resolve();
                })


            }).catch((err) => {
                console.log(err)
                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            });
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
            BKE.loadstatus = "Loading data...";
            AssetLoader.loadPercentage.set(preloadAsset, 0.0);
            const path = preloadAsset.path;
            console.log("ASSETLOADER: Loading " + preloadAsset.path)


            Platform.getCurrent().loadPathAsText(path).then((text) => {
                AssetLoader.assets.set(preloadAsset, text);
                AssetLoader.assetLoaded(preloadAsset, callback);
                resolve();
                AssetLoader.loadPercentage.set(preloadAsset, 1.0);
            }).catch(() => {
                AssetLoader.assetNotLoaded(preloadAsset, callback);
                resolve();
            });
        });
    }



    private static assetNotLoaded(asset: PreloadAsset, callback: () => void) {
        console.warn("ASSETLOADER: Asset " + asset.path + " not loaded!")
        console.log(asset);
        AssetLoader.assetLoaded(asset, callback);
    }

    private static assetLoaded(asset: PreloadAsset, callback: () => void) {
        AssetLoader.cacheQueue.splice(AssetLoader.cacheQueue.indexOf(asset), 1);
        AssetLoader.totalLoading = AssetLoader.cacheQueue.length;
        console.log("ASSETLOADER: Loaded " + asset.path)
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

    static getSound(asset: PreloadAsset): ISound {
        return (AssetLoader.assets.get(asset) as ISound);
    }

    static getPannerSound(asset: PreloadAsset): IPannerSound {
        return (AssetLoader.assets.get(asset) as IPannerSound);
    }

    static getStereoPannerSound(asset: PreloadAsset): IStereoPannerSound {
        return (AssetLoader.assets.get(asset) as IStereoPannerSound);
    }

    static getMusicSound(asset: PreloadAsset): IMusicSound {
        return (AssetLoader.assets.get(asset) as IMusicSound);
    }

    static getText(asset: PreloadAsset): string {
        return (AssetLoader.assets.get(asset) as string);
    }
}