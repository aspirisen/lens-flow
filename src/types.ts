import { Lens } from "./Lens";

export interface Interop<Value> {
    value: Value | null;
    onChange: (value: Value | null) => void;
}

export interface TurnTransform<Value, State> {
    value: Value;
    state: State;
}

export type IteratorCallback<Value, Result> = (item: Value, index: number, arr: Value[], lens: Lens<Value>) => Result;

export interface ValidationState {
    isValid: boolean;
}

export interface Meta {
    [key: string]: any;
}

export interface Metadata<Value> extends Partial<Meta> {
    all?: Meta;
    props?: {[Key in keyof Value]?: Partial<Metadata<Value[Key]>>};
}
