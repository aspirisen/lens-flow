import { ArrayLensProperty, LensProperty } from "./core/Property";
import { TransformLens, TransformViewState } from "./core/Transform";
import * as types from "./types";

export abstract class Lens<Value> {

    public state: Lens<any>;
    protected parent: Lens<any>;
    protected interop: types.Interop<Value>;
    protected lensCache: Record<string, Record<string, Lens<any>>> = {};

    constructor(
        protected getParent: () => Lens<any>,
    ) {
        this.parent = getParent();
    }

    public abstract get(): Value | null;
    public abstract set(value: Value | null): void;

    public prop<Focus extends Value[Key], Key extends keyof Value, S>(
        lambdaOrName: Key | ((v: Value) => Focus),
        defaultValue?: Focus,
        initialState?: S,
    ): LensProperty<Focus, Value> {
        return new LensProperty(() => this, lambdaOrName, defaultValue, initialState);
    }

    public item<S>(name: string | number, defaultValue?: any, initialState?: S): Lens<any> {
        return this.prop(name as any, defaultValue, initialState);
    }

    public array<Focus>(
        this: Lens<{[k in keyof Value]: Focus[] | {}}>,
        getterOrName: keyof Value | ((v: Value) => Focus[]),
        idField?: keyof Focus,
    ): ArrayLensProperty<Focus, Value> {
        return new ArrayLensProperty(() => this, getterOrName, idField);
    }

    public defaultValue(defaultValue: Value): Lens<Value> {
        return this.transform((val) => val == null ? defaultValue : val);
    }

    public transform<T2>(
        toView?: (val: Value) => T2,
        toModel?: (viewVal: T2, modelVal: Value) => Value,
        getMetadata?: (parentMeta: types.Metadata<Value>) => types.Metadata<Value>,
        getValidationState?: (parentValidationState: types.ValidationState) => types.ValidationState,
    ) {
        return new TransformLens(() => this, toView, toModel, getMetadata, getValidationState);
    }

    public turn<T2, S2>(
        toView?: (val: types.TurnTransform<Value, any>) => types.TurnTransform<T2, S2>,
        toModel?: (viewVal: types.TurnTransform<T2, S2>, modelVal: types.TurnTransform<Value, any>) => types.TurnTransform<Value, any>,
        getMetadata?: (parentMeta: types.Metadata<Value>) => types.Metadata<Value>,
        getValidationState?: (parentValidationState: types.ValidationState) => types.ValidationState,
    ): TransformViewState<Value, any, T2, S2> {
        return new TransformViewState(() => this, toView, toModel, getMetadata, getValidationState);
    }

    public getMetadata(): types.Metadata<Value> {
        return this.parent ? this.parent.getMetadata() : {};
    }

    public getMetadataProp<K extends keyof types.Meta>(name: K): types.Meta[K] {
        const metadata = this.getMetadata();

        if (metadata) {
            const meta = metadata[name];

            if (meta != null) {
                return meta;
            }
        }

        if (this.parent) {
            return this.parent.getMetadataProp(name);
        }

        return null;
    }

    public getValidationState(): types.ValidationState {
        return this.parent ? this.parent.getValidationState() : { isValid: true };
    }

    public isInvalid(): boolean {
        const validationState = this.getValidationState();
        return validationState && validationState.isValid === false;
    }

    public getInterop() {
        if (!this.interop) {
            this.interop = {
                onChange: (v) => this.set(v),
            } as types.Interop<Value>;
        }

        return { ...this.interop, value: this.get() };
    }

    public getOrigin(): Lens<any> | null {
      const parent = this.parent || this.getParent();
      if (!parent || parent === this) {
        return this;
      }

      if (parent.getOrigin) {
          return parent.getOrigin();
      }

      return null;
    }

    protected cache(kind: string, key: string, lens: Lens<any>) {
        if (!this.parent.lensCache[kind]) {
            this.parent.lensCache[kind] = {};
        }

        this.parent.lensCache[kind][key] = lens;
    }

    protected getFromCache(kind: string, key: string): this | null {
        if (!this.parent.lensCache[kind]) {
            this.parent.lensCache[kind] = {};
        }

        return this.parent.lensCache[kind][key] as this;
    }

    protected removeFromCache(kind: string, key: string) {
        if (this.parent.lensCache[kind]) {
            delete this.parent.lensCache[kind][key] ;
        }
    }

    protected getWhenNull(): Value | null {
        return this.parent.getWhenNull();
    }

    protected setWhenNull(value: Value): void {
        this.parent.setWhenNull(value);
    }

}
