import { expect } from "chai";
import { LensFlow } from "../";
import { getValue } from "./mock";

describe("lens-flow", () => {

    it("Metadata queries should returns correct results", () => {
        let data = getValue();

        const lens = new LensFlow(() => data, (d) => data = d, () => ({
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
        }));

        const objProp = lens.prop((s) => s.obj);
        expect(objProp.getMetadataProp("isRequired"))
            .to.be.null;
        expect(objProp.getMetadataProp("isReadonly"))
            .to.be.true;

        const nameProp = objProp.prop((o) => o.name);
        expect(nameProp.getMetadataProp("isRequired"))
            .to.be.true;
        expect(nameProp.getMetadataProp("isReadonly"))
            .to.be.true; // parent values override children

        const valueProp = objProp.prop((o) => o.value);
        const isRequired = valueProp.getMetadataProp("isRequired");

        expect(isRequired)
            .to.be.false;
        expect(valueProp.getMetadataProp("isReadonly"))
            .to.be.true; // get value from parent

        const stringProp = lens.prop((o) => o.stringProp); // prop w/ o explicit metadata
        expect(stringProp.getMetadataProp("isRequired"))
            .to.be.null;
        expect(stringProp.getMetadataProp("isReadonly"))
            .to.be.true; // get value from parent
    });

});
