import MathUtil from "../utilities/MathUtil";


export interface IComponent<T> {
    readonly default: T;
}


export class Component<T> implements IComponent<T> {
    readonly default: T;
    value: T;

    constructor(value: T) {
        this.value = value;
        this.default = value;
    }

    isDefault(): boolean {
        return this.value === this.default;
    }

    validate(): boolean {
        return true;
    }
}

export interface IBoundedNumberComponent extends IComponent<number> {
    readonly minValue: number;
    readonly maxValue: number;
}

export class BoundedNumberComponent extends Component<number> implements IBoundedNumberComponent {
    readonly minValue: number;
    readonly maxValue: number;

    constructor(component: IBoundedNumberComponent) {
        super(component.default);
        this.minValue = component.minValue;
        this.maxValue = component.maxValue;
    }

    public static of(component: IBoundedNumberComponent) {
        return new BoundedNumberComponent(component);
    }

    override validate(): boolean {
        return MathUtil.inBounds(this.value, this.minValue, this.maxValue)
    }
}



export interface INumberComponent extends IComponent<number> {
}

export class NumberComponent extends Component<number> implements INumberComponent {
    constructor(value: number) {
        super(value);
    }

    public static of(value: number) {
        return new NumberComponent(value);
    }
}


export interface IBooleanComponent extends IComponent<boolean> { }

export class BooleanComponent extends Component<boolean> implements IBooleanComponent {
    constructor(value: boolean) {
        super(value);
    }

    public static of(value: boolean) {
        return new BooleanComponent(value);
    }
}


export interface IBoundedStringComponent extends IComponent<string> {
    readonly minLength: number;
    readonly maxLength: number;
}

export class BoundedStringComponent extends Component<string> implements IBoundedStringComponent {
    readonly minLength: number;
    readonly maxLength: number;

    constructor(component: IBoundedStringComponent) {
        super(component.default);
        this.minLength = component.minLength;
        this.maxLength = component.maxLength;
    }

    public static of(component: IBoundedStringComponent) {
        return new BoundedStringComponent(component);
    }

    override validate(): boolean {
        return MathUtil.inBounds(this.value.length, this.minLength, this.maxLength)
    }
}


export interface IStringComponent extends IComponent<string> {

}

export class StringComponent extends Component<string> implements IStringComponent {

    constructor(value: string) {
        super(value);
    }

    public static of(value: string) {
        return new StringComponent(value);
    }
}

export interface IBigIntComponent extends IComponent<bigint> {

}

export class BigIntComponent extends Component<bigint> implements IBigIntComponent {

    constructor(value: bigint) {
        super(value);
    }

    public static of(value: bigint) {
        return new BigIntComponent(value);
    }
}

export interface IArrayComponent<T> extends IComponent<Array<T>> {
}

export class ArrayComponent<T> extends Component<Array<T>> implements IArrayComponent<T> {
    constructor(value: Array<T>) {
        super(value);
    }

    public static of<T>(value: Array<T>) {
        return new ArrayComponent(value);
    }
}


export interface IOptionComponent<T> extends IComponent<T> {
    options: Array<T>;
}

export class OptionComponent<T> extends Component<T> implements IOptionComponent<T> {
    options: T[];
    constructor(component: IOptionComponent<T>) {
        super(component.default);
        this.options = component.options;
    }


    public static of<T>(component: IOptionComponent<T>) {
        return new OptionComponent(component);
    }

    override validate(): boolean {
        return this.options.indexOf(this.value) !== -1;
    }
}
