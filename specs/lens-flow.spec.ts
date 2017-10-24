import { expect } from "chai";
import { LensFlow, StatefulLens } from "../";
import { getValue } from "./mock";

describe("lens-flow", () => {
    it("Metadata queries should returns correct results", () => {
        let data = getValue();

        const lens = new LensFlow(
            () => data,
            (d) => (data = d),
            () => ({
                isReadonly: true,
                props: {
                    obj: {
                        props: {
                            name: {
                                isRequired: true,
                                props: undefined,
                            },
                            value: {
                                isRequired: false,
                                isReadonly: true,
                                props: undefined,
                            },
                        },
                    },
                },
            }),
        );

        const objProp = lens.prop((s) => s.obj);
        expect(objProp.getMetadataProp("isRequired")).to.be.null;
        expect(objProp.getMetadataProp("isReadonly")).to.be.true;

        const nameProp = objProp.prop((o) => o.name);
        expect(nameProp.getMetadataProp("isRequired")).to.be.true;
        expect(nameProp.getMetadataProp("isReadonly")).to.be.true; // parent values override children

        const valueProp = objProp.prop((o) => o.value);
        const isRequired = valueProp.getMetadataProp("isRequired");

        expect(isRequired).to.be.false;
        expect(valueProp.getMetadataProp("isReadonly")).to.be.true; // get value from parent

        const stringProp = lens.prop((o) => o.stringProp); // prop w/ o explicit metadata
        expect(stringProp.getMetadataProp("isRequired")).to.be.null;
        expect(stringProp.getMetadataProp("isReadonly")).to.be.true; // get value from parent
    });

    it("Should check that StatefulLens is immutable on set", () => {
        const lens = new StatefulLens({ one: 1 }, {});
        const lensSafe = lens;

        lens.set({ one: 11 });
        expect(lens).to.be.equal(lensSafe);
        expect(lens.get()).to.be.deep.equal({ one: 11 });

        let immutableLens = lens.immutable(
            (nextLens) => (immutableLens = nextLens),
        );
        const immutableLensSafe = immutableLens;

        immutableLens.set({ one: 111 });
        expect(immutableLens).to.be.not.equal(immutableLensSafe);
        expect(immutableLens.get()).to.be.deep.equal({ one: 111 });
    });

    it("Should check that LensFlow is immutable on set", () => {
        let value = { one: 1 };
        const lens = new LensFlow(
            () => value,
            (nextValue) => (value = nextValue),
        );
        const lensSafe = lens;

        lens.set({ one: 11 });
        expect(lens).to.be.equal(lensSafe);
        expect(lens.get()).to.be.deep.equal({ one: 11 });

        let immutableLens = lens.immutable(
            (nextLens) => (immutableLens = nextLens),
        );
        const immutableLensSafe = immutableLens;

        immutableLens.set({ one: 111 });
        expect(immutableLens).to.be.not.equal(immutableLensSafe);
        expect(immutableLens.get()).to.be.deep.equal({ one: 111 });
    });

    it("Should check that immutable StatefulLens is changed when you change its state", () => {
        const lens = new StatefulLens({ one: 1 }, {});
        const lensSafe = lens;

        lens.state.set({ one: 11 });
        expect(lens).to.be.equal(lensSafe);
        expect(lens.state.get()).to.be.deep.equal({ one: 11 });

        let immutableLens = lens.immutable(
            (nextLens) => (immutableLens = nextLens),
        );

        const immutableLensSafe = immutableLens;

        immutableLens.state.set({ one: 111 });
        expect(immutableLens).to.be.not.equal(immutableLensSafe);
        expect(immutableLens.state.get()).to.be.deep.equal({ one: 111 });
    });

    it("Should check that immutable LensFlow is changed when you change its state", () => {
        let value = { one: 1 };
        let state = { one: 1111 };

        const lens = new LensFlow(
            () => value,
            (nextValue) => (value = nextValue),
            undefined,
            undefined,
            () => state,
            (newState) => state = newState,
        );
        const lensSafe = lens;

        lens.set({ one: 11 });
        expect(lens).to.be.equal(lensSafe);
        expect(lens.get()).to.be.deep.equal({ one: 11 });

        let immutableLens = lens.immutable(
            (nextLens) => (immutableLens = nextLens),
        );
        const immutableLensSafe = immutableLens;

        immutableLens.set({ one: 111 });
        expect(immutableLens).to.be.not.equal(immutableLensSafe);
        expect(immutableLens.get()).to.be.deep.equal({ one: 111 });
    });

    it("Should check that immutable LensFlow is changed when you change its prop state", () => {
        let value = { one: 1 };
        let state = { one: {two: 2} };

        const lens = new LensFlow(
            () => value,
            (nextValue) => (value = nextValue),
            undefined,
            undefined,
            () => state,
            (newState) => state = newState,
        );

        const lensSafe = lens;

        lens.state.prop('one').prop('two').set(11);
        expect(lens).to.be.equal(lensSafe);
        expect(lens.state.prop('one').prop('two')).to.be.equal(lens.state.prop('one').prop('two'));
        expect(lens.state.prop('one').prop('two').get()).to.be.deep.equal(11);

        let immutableLens = lens.immutable(
            (nextLens) => (immutableLens = nextLens),
        );

        const immutableLensSafe = immutableLens;

        immutableLens.state.prop('one').prop('two').set(22);
        expect(lens).to.be.not.equal(immutableLensSafe);
        expect(lens.state.prop('one').prop('two')).to.be.equal(lens.state.prop('one').prop('two'));
        expect(lens.state.prop('one').prop('two').get()).to.be.deep.equal(22);
    });
});
