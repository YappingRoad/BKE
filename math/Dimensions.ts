import Android from "../android/Android";
import Renderer from "../renderers/Renderer";
import BrowserUtil from "../utilities/BrowserUtil";
import MathUtil from "../utilities/MathUtil";
import Rectangle from "./Rectangle";
import Vector2 from "./Vector2";

export default class Dimensions {
    public static GAME_WIDTH: number = 640;
    public static GAME_HEIGHT: number = 360;

    public static RATIOS: Map<number, Vector2> = new Map();

    public static init() {
        Dimensions.RATIOS = new Map();
        // upscaled to 1080p, 720p etc
        Dimensions.RATIOS.set((16 / 9), { x: 640, y: 360 });


    }

    public static getWidth(): number {
        let width: number = document.body.clientWidth;
        let height: number = document.body.clientHeight;

        // safari web app
        if (BrowserUtil.isiOSPWA()) {
            // safari doesnt update screen dimensions when rotated because fuck you 
            width = document.body.clientWidth > document.body.clientHeight ? screen.height : screen.width;
            height = document.body.clientWidth > document.body.clientHeight ? screen.width : screen.height;
        }

        const screenRatio: number = width / height;
        const nearestAllowedRatio = MathUtil.getClosestNumberMap(Dimensions.RATIOS.keys(), screenRatio);
        if (screenRatio == nearestAllowedRatio) {
            return width;
        }

        const nearestRes = Dimensions.RATIOS.get(nearestAllowedRatio);

        if (nearestRes === undefined) {
            return Dimensions.GAME_WIDTH;
        }


        const ratio: number = Math.min(width / nearestRes.x, height / nearestRes.y);

        return Math.ceil(nearestRes.x * ratio);
    }



    public static getHeight(): number {

        let width: number = document.body.clientWidth;
        let height: number = document.body.clientHeight;

        // safari web app
        if (BrowserUtil.isiOSPWA()) {
            // safari doesnt update screen dimensions when rotated because fuck you 
            width = document.body.clientWidth > document.body.clientHeight ? screen.height : screen.width;
            height = document.body.clientWidth > document.body.clientHeight ? screen.width : screen.height;
        }

        const screenRatio: number = width / height;
        const nearestAllowedRatio = MathUtil.getClosestNumberMap(Dimensions.RATIOS.keys(), screenRatio);
        if (screenRatio == nearestAllowedRatio) {
            return height;
        }

        const nearestRes = Dimensions.RATIOS.get(nearestAllowedRatio);

        if (nearestRes === undefined) {
            return Dimensions.GAME_HEIGHT;
        }


        const ratio: number = Math.min(width / nearestRes.x, height / nearestRes.y);

        return Math.ceil(nearestRes.y * ratio);
    }


    public static getVector(): Vector2 {

        let width: number = document.body.clientWidth;
        let height: number = document.body.clientHeight;

        // safari web app
        if (BrowserUtil.isiOSPWA()) {
            // safari doesnt update screen dimensions when rotated because fuck you 
            width = document.body.clientWidth > document.body.clientHeight ? screen.height : screen.width;
            height = document.body.clientWidth > document.body.clientHeight ? screen.width : screen.height;
        }

        const screenRatio: number = width / height;
        const nearestAllowedRatio = MathUtil.getClosestNumberMap(Dimensions.RATIOS.keys(), screenRatio);
        if (screenRatio == nearestAllowedRatio) {
            return { x: width, y: height };
        }

        const nearestRes = Dimensions.RATIOS.get(nearestAllowedRatio);

        if (nearestRes === undefined) {
            return { x: Dimensions.GAME_WIDTH, y: Dimensions.GAME_HEIGHT };
        }


        const ratio: number = Math.min(width / nearestRes.x, height / nearestRes.y);

        return { x: Math.ceil(nearestRes.x * ratio), y: Math.ceil(nearestRes.y * ratio) };
    }

    public static gameRect(): Rectangle {
        return { x: 0, y: 0, width: Dimensions.GAME_WIDTH, height: Dimensions.GAME_HEIGHT };
    }


    public static UIRect(): Rectangle {
        const UILeft = Dimensions.getUILeft();
        const UITop = Dimensions.getUITop();

        return { x: UILeft, y: UITop, width: Math.abs(UILeft) + Dimensions.getUIRight(), height: Math.abs(UITop) + Dimensions.getUIBottom() };
    }

    public static UISafeRect(): Rectangle {
        const UILeft = Dimensions.getSafeUILeft();
        const UITop = Dimensions.getUITop();

        return { x: UILeft, y: UITop, width: Math.abs(UILeft) + Dimensions.getSafeUIRight(), height: Math.abs(UITop) + Dimensions.getUIBottom() };
    }

    private static UILeft: number | undefined = undefined;
    public static getUILeft(): number {
        if (Dimensions.UILeft === undefined) {
            const size = Renderer.CURRENT.getSafeAreaDimensions();
            const xScale = size.x / Dimensions.GAME_WIDTH;
            Dimensions.UILeft = -((Renderer.CURRENT.getSafeAreaOffset().x) / xScale);

        }
        return Dimensions.UILeft;
    }


    /** 
     * Accounts for notches
    */
    public static getSafeUILeft(): number {
        const size = Renderer.CURRENT.getSafeAreaDimensions();
        const xScale = size.x / Dimensions.GAME_WIDTH;
        return -((Renderer.CURRENT.getSafeAreaOffset().x - Dimensions.getNotchOffsetLeft()) / xScale);
    }

    private static getNotchOffsetLeft() {
        return Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal").replace("px", "")) * window.devicePixelRatio;
    }

    private static getNotchOffsetRight() {
        return Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar").replace("px", ""));
    }

    public static getUIRight(): number {
        return Dimensions.GAME_WIDTH - Dimensions.getUILeft();
    }

    public static getSafeUIRight(): number {
        return (Dimensions.GAME_WIDTH - Dimensions.getSafeUILeft());
    }

    private static UITop: number | undefined = undefined;
    public static getUITop(): number {
        if (Dimensions.UITop === undefined) {
            const size = Renderer.CURRENT.getSafeAreaDimensions();
            const yScale = size.y / Dimensions.GAME_HEIGHT;
            Dimensions.UITop = -(Renderer.CURRENT.getSafeAreaOffset().y / yScale);
        }
        return Dimensions.UITop;
    }

    private static UIBottom: number | undefined = undefined;
    public static getUIBottom(): number {
        if (Dimensions.UIBottom === undefined) {
            Dimensions.UIBottom = Dimensions.GAME_HEIGHT - Dimensions.getUITop();
        }
        return Dimensions.UIBottom;
    }

    private static UIScale: number | undefined = undefined;
    public static getUIScale(): number {
        if (Dimensions.UIScale === undefined) {                                      // older ios fix
            Dimensions.UIScale = (BrowserUtil.isiOSPWA() || Android.isAvailable()) ? Math.max(1.5, window.devicePixelRatio / 2) : (Dimensions.getScale());


        }
        return Dimensions.UIScale;
    }

    private static scale: number | undefined = undefined;
    private static getScale(): number {
        if (Dimensions.scale === undefined) {
            const rect = Dimensions.UIRect()
            Dimensions.scale = MathUtil.bound(Math.max((rect.width / Dimensions.GAME_WIDTH), (rect.height / Dimensions.GAME_HEIGHT)), 0.0, (5 / 3))
        }
        return Dimensions.scale;
    }


    private static widthRatio: number | undefined = undefined;
    public static getWidthRatio(): number {
        if (Dimensions.widthRatio === undefined) {
            const rect = Dimensions.UIRect()
            Dimensions.widthRatio = (rect.width / Dimensions.GAME_WIDTH);
        }
        return Dimensions.widthRatio;
    }

    private static heightRatio: number | undefined = undefined;
    public static getHeightRatio(): number {
        if (Dimensions.heightRatio === undefined) {
            const rect = Dimensions.UIRect()
            Dimensions.heightRatio = (rect.height / Dimensions.GAME_HEIGHT);
        }
        return Dimensions.heightRatio;
    }

    public static recalculate(): void {
        Dimensions.UILeft = undefined;
        Dimensions.UITop = undefined;
        Dimensions.UIBottom = undefined;

        Dimensions.UIScale = undefined;
        Dimensions.scale = undefined;

        Dimensions.widthRatio = undefined;
        Dimensions.heightRatio = undefined;
    }

}