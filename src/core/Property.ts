import "./Transform";
import * as types from "../types";
import { Lens } from "../Lens";
import { Lambda } from "../utils";

export class LensProperty<Value, ParentValue> extends Lens<Value> {

    protected propName: string;

    constructor(
        protected getParent: () => Lens<any>,
        protected lambdaOrName: keyof ParentValue | ((v: ParentValue) => Value),
        protected defaultOnNullValue?: Value,
        protected initialState?: any
    ) {
        super(getParent);

        const propPath = this.getPropPath();

        if (propPath.length > 1) {
            return propPath.reduce<any>((lens: Lens<any>, prop) => lens.prop(prop), getParent());
        } else {
            const lastPropName = propPath.slice().pop();

            if (lastPropName == null) {
                this.propName = "";
            } else {
                this.propName = lastPropName;
            }
        }

        if (this.parent.state) {
            this.state = this.parent.state.prop(lambdaOrName, initialState);
        }

        const fromCache = this.getCache();

        if (fromCache) {
            return fromCache;
        } else {
            this.addToCache();
        }
    }

    public get(): Value | null {
        const parentValue = this.parent.get();

        if (parentValue == null) {
            return this.getWhenNull();
        }

        const value = parentValue[this.propName];

        if (value == null) {
            return this.getWhenNull();
        } else {
            return value;
        }
    }

    public set(value: Value): void {
        const parentValue = this.parent.get();
        this.removeCache();

        if (parentValue == null) {
            this.setWhenNull(value);
        } else {
            const newValue = this.getNewValue(parentValue, value);
            this.parent.set(newValue);
        }

    }

    public getMetadata(): types.Metadata<Value> {
        const parentMeta = this.parent.getMetadata();

        if (parentMeta && parentMeta.props) {
            return parentMeta.props[this.propName];
        }

        return {};
    }

    public getValidationState(): types.ValidationState {
        if (this.parent) {
            const validationState = this.parent.getValidationState() as any;

            if (validationState && validationState.props) {
                return validationState.props[this.propName] || {};
            } else {
                return validationState || {};
            }
        }

        return { isValid: true };
    }

    protected getNewValue(parentValue: any, value: Value) {
        const newValue = parentValue instanceof Array ? parentValue.slice() : { ...parentValue };
        newValue[this.propName] = value;
        return newValue;
    }

    protected getWhenNull(): Value | null {
        return this.defaultOnNullValue == null ? null : this.defaultOnNullValue;
    }

    protected setWhenNull(value: Value): void {
        this.parent.set({ [this.propName]: value });
    }

    protected getPropPath() {
        if (this.lambdaOrName instanceof Function) {
            return Lambda.parse(this.lambdaOrName);
        } else {
            return [this.lambdaOrName];
        }
    }

    protected addToCache() {
        this.cache("prop", this.propName, this);
    }

    protected getCache() {
        return this.getFromCache("prop", this.propName);
    }

    protected removeCache() {
        this.removeFromCache("prop", this.propName);
    }

}

export class ArrayLensProperty<Value, ParentValue> extends LensProperty<Value[], ParentValue> {

    private static lastId = -1;

    constructor(
        protected getParent: () => Lens<any>,
        protected lambdaOrName: keyof ParentValue | ((v: ParentValue) => Value[]),
        protected idField?: keyof Value,
        protected defaultOnNullValue?: Value[]
    ) {
        super(getParent, lambdaOrName, defaultOnNullValue);
    }

    public item<S>(name: number, defaultValue?: any, initialState?: S): Lens<Value> {
        return this.prop(name as any, defaultValue, initialState);
    }

    public defaultValue(defaultValue: Value[]) {
        return new ArrayLensProperty(this.getParent, this.lambdaOrName, this.idField, defaultValue);
    }

    public forEach(cb: types.IteratorCallback<Value, void>) {
        const data = this.get() || [];
        data.forEach((v, i, a) => cb(this.item(i), i, a, v));
    }

    public find(cb: types.IteratorCallback<Value, boolean>): Lens<Value> | null {
        const data = this.get() || [];
        let found: Lens<Value> | null = null;

        data.forEach((v, i, a) => {
            const currentItem = this.item(i);

            if (cb(currentItem, i, a, v)) {
                found = found || currentItem;
            }
        });

        return found;
    }

    public map<Result>(cb: types.IteratorCallback<Value, Result>): Result[] {
        const result: Result[] = [];
        this.forEach((l, i, a, v) => result.push(cb(l, i, a, v)));
        return result;
    }

    public slice(begin: number | undefined, end: number | undefined) {
        const data = this.get() || [];

        return new ArrayLensProperty(() => this, this.lambdaOrName, this.idField, data.slice(begin, end));
    }

    public remove(what: Value[keyof Value] | Value | Lens<Value>) {
        let items = this.get() || [];

        if (what instanceof Lens) {
            const value = what.get();
            items = items.filter( i => i !== value);
        } else if (typeof what === "object") {
            items = items.filter( i => i !== what);
        } else {
            items = items.filter( i => this.idField && i[this.idField] !== what);
        }

        this.set(items);
    }

    public insert(item: Value): number {
        return this.insertMany([item]);
    }

    public insertMany(items: Value[] = []): number {
        const value = this.get() || [];
        const result = value.concat(items);
        this.set(result);

        if (result.length > 0) {
            return value.length;
        } else {
            return -1;
        }
    }

    public insertUnique(items: Value[] = []) {
        let result = this.get() || [];

        if (this.idField) {
            const newItemsIds: Record<string, boolean> = {};

            items.forEach( item => {
                if (this.idField) {
                    let id = item[this.idField];

                    if (id == null) {
                        id = ArrayLensProperty.lastId-- as any as Value[keyof Value];
                        item[this.idField] = id;
                    }

                    newItemsIds[id as any as string] = true;
                }
            });

            result = result.filter( i => this.idField ? !newItemsIds[i[this.idField] as any as string] : true);
        }

        result = result.concat(items);
        this.set(result);
    }

    protected setWhenNull(value: Value[]): void {
        const length = Object.keys(value).length;
        const arr = Array.from({ ...value, length } as ArrayLike<Value>);
        this.parent.set({ [this.propName]: arr });
    }

    protected addToCache() {
        this.cache("array", this.propName, this);
    }

    protected removeCache() {
        this.removeFromCache("array", this.propName);
    }

    protected getCache() {
        if (this.defaultOnNullValue == null) {
            return this.getFromCache("array", this.propName);
        } else {
            return null;
        }
    }

}
