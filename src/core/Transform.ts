import * as types from "../types";
// tslint:disable-next-line:ordered-imports
import { Lens } from "../Lens";

export class TransformLens<T1, T2> extends Lens<T2> {

    constructor(
        getParent: () => Lens<any>,
        private getterTransformer?: (from: T1) => T2,
        private setterTransformer?: (mapped: T2, actual: T1) => T1,
        private metadataTransformer?: (parentMeta: types.Metadata<T1>) => types.Metadata<T1>,
        private validationStateTransformer?: (parentState: types.ValidationState) => types.ValidationState,

    ) {
        super(getParent);
    }

    public get(): T2 {
        let val = this.parent.get();

        if (this.getterTransformer) {
            val = this.getterTransformer(val);
        }

        return val;
    }

    public set(newValue: T2) {
        if (this.setterTransformer) {
            const updated = this.setterTransformer(newValue, this.parent.get());
            this.parent.set(updated);
        } else {
            this.parent.set(newValue);
        }
    }

    public getMetadata(): types.Metadata<T2> {
        let meta = this.parent.getMetadata() || {};

        if (this.metadataTransformer) {
            meta = this.metadataTransformer(meta);
        }

        return meta;
    }

    public getValidationState() {
        let validationState = this.parent.getValidationState() || { isValid: true };

        if (this.validationStateTransformer) {
            validationState = this.validationStateTransformer(validationState);
        }

        return validationState;
    }

}

export class TransformViewState<T1, S1, T2, S2> extends TransformLens<T1, T2> {

    constructor(
        getParent: () => Lens<any>,
        private toView?: (val: types.TurnTransform<T1, S1>) => types.TurnTransform<T2, S2>,
        private toModel?: (viewVal: types.TurnTransform<T2, S2>, modelVal: types.TurnTransform<T1, S1>) => types.TurnTransform<T1, S1>,
        metadataTransformer?: (parentMeta: types.Metadata<T1>) => types.Metadata<T1>,
        validationStateTransformer?: (parentState: types.ValidationState) => types.ValidationState,
    ) {
        super(getParent, undefined, undefined, metadataTransformer, validationStateTransformer);

        if (this.parent.state) {
            this.state = this.parent.state.transform(() => this.getState(), (state) => this.computeComplexValue({ state }).state);
        }
    }

    public get(): T2 {
        const complexValue = this.getComplexValue();

        if (complexValue) {
            return complexValue.value;
        } else {
            return super.get();
        }
    }

    public set(value: T2) {
        this.computeComplexValue({ value });
    }

    protected getState(): S2 {
        const complexValue = this.getComplexValue();

        if (complexValue) {
            return complexValue.state;
        } else {
            return this.parent.state.get();
        }
    }

    private computeComplexValue(newValue: Partial<types.TurnTransform<T2, S2>>) {
        const modelValue = this.getModelValue();

        const viewVal = {
            state: newValue.state == null ? this.getState() : newValue.state,
            value: newValue.value == null ? this.get() : newValue.value,
        };

        const updated = this.toModel ? this.toModel(viewVal, modelValue) : modelValue;

        if (this.parent.state) {
            this.parent.state.set(updated.state);
        }

        this.parent.set(updated.value);

        return updated;
    }

    private getModelValue(): types.TurnTransform<T1, S1> {
        return {
            state: this.parent.state ? this.parent.state.get() : null,
            value: this.parent.get(),
        };
    }

    private getComplexValue() {
        if (this.toView) {
            return this.toView(this.getModelValue());
        } else {
            return null;
        }
    }

}
