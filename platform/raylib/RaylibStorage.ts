import { IStorage } from "../Platform";
import * as r from "raylib";
import fs from "fs";
export default class RaylibStorage implements IStorage {
    [name: string]: any;


    fileData: any;
    constructor() {
        this.fileData = JSON.parse(fs.readFileSync("save.json", { encoding: "utf-8" }));

    }
    get length(): number {
        return 0;
    }
    clear(): void {
        this.fileData = {};
        fs.writeFileSync("save.json", JSON.stringify(this.fileData))
    }
    getItem(key: string): string | null {
        return !!this.fileData[key] ? this.fileData[key] : null;
    }
    key(index: number): string | null {
        return "";

    }
    removeItem(key: string): void {
        this.fileData[key] = undefined;
        fs.writeFileSync("save.json", JSON.stringify(this.fileData))
    }
    setItem(key: string, value: string): void {
        this.fileData[key] = value;
        fs.writeFileSync("save.json", JSON.stringify(this.fileData))
    }

}