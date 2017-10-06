import { StatefulLens } from "../src/index";

export interface IdAndName {
    id: number;
    name: string;
}

export interface Entity {
    name: string;
    value: number;
    internal: { a: string, b: string };
}

export interface Structure {
    list: IdAndName[];
    name: string;
    intProp: number;
    stringProp: string;
    obj: Entity;
    objNull: any;
    empty: Entity;
}

export const getValue = () => ({
    intProp: 10,
    list: [{
        id: 1,
        name: "one",
    }, {
        id: 2,
        name: "two",
    }],
    name: "John",
    stringProp: "initial",
    objNull: null,
    obj: {
        internal: { a: "a", b: "b" },
        name: "initial",
        value: 123,
    },
} as Structure);

export const value = getValue();

export const getLens = () => {
    const state = getValue();
    return new StatefulLens(state, {});
};
