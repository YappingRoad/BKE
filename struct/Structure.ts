import { ArrayComponent, BigIntComponent, BooleanComponent, Component, IComponent, NumberComponent, StringComponent } from "./Component";

export type StructureObjects = Structure | Component<any> | NumberComponent | StringComponent | BooleanComponent | ArrayComponent<any> | BigIntComponent | (() => Structure);
// dont know if this is a good idea but fuck it we ball
export interface IStructure {
    create(): Structure;
    [name: string]: StructureObjects;
}


export class Structure implements IStructure {
    create(): Structure {
        return new Structure();
    }

    // probably not the best way to check
    static isDefault(struct: Structure) {
        return Structure.getJSON(struct.create()) === Structure.getJSON(struct)
    }

    static of(obj: any): Structure {
        const struct = new Structure();
        for (const [key, value] of Object.entries(obj)) {
            const object = Structure.createObject(value);
            if (object !== undefined) {
                struct[key] = object;
            }
        }
        return struct;
    }


    private static createObject(value: any): StructureObjects | undefined {
        if (Structure.isComponent(value) || value instanceof Structure) {
            return value;
        }
        if (Array.isArray(value)) {
            return ArrayComponent.of(value);
        }

        switch (typeof value) {
            case "function":
            case "undefined":
                return undefined
            case "string":
                return StringComponent.of(value);
            case "number":
                return NumberComponent.of(value);
            case "bigint":
                return BigIntComponent.of(value);
            case "boolean":
                return BooleanComponent.of(value);
            case "symbol":
                return StringComponent.of(Symbol.keyFor(value) as string)

            case "object":
                return Structure.of(value)

        }



        return undefined;
    }

    static getJSON(struct: Structure): string {
        let obj: any = {};
        for (const [key, value] of Object.entries(struct)) {
            if (Structure.isComponent(value)) {
                if (value.isDefault()) {
                    continue;
                }
                obj[key] = value.value;
                // console.log(key, value)
            }
            else if (struct[key] instanceof Structure) {
                let s = JSON.parse(Structure.getJSON(struct[key]));
                if (JSON.stringify(s) == "{}") {
                    continue;
                }
                obj[key] = s;

            }
            else {
                continue;
            }
        }
        return JSON.stringify(obj);
    }

    static loadJSON(struct: Structure, json: string) {
        let obj = JSON.parse(json);
        for (const [key, value] of Object.entries(obj)) {
            if (Structure.isComponent(struct[key])) {
                if (obj[key] === undefined || obj[key] === null) {
                    struct[key].value = struct[key].default;

                    continue;
                }
                struct[key].value = value;
            }
            else if (struct[key] instanceof Structure) {
                if (obj[key] === undefined || obj[key] === null) {
                    continue;
                }
                console.log(JSON.stringify(value))
                struct[key] = Structure.loadJSON(struct[key].create(), JSON.stringify(value))
            }
            else {
                continue;
            }

        }
        return struct;
    }


    static isComponent(member: StructureObjects): member is Component<any> {
        return (member as Component<any>).value !== undefined && (member as Component<any>).default !== undefined;
    }

    [name: string]: StructureObjects;
}