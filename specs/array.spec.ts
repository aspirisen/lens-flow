import { expect } from "chai";
import { getLens, value } from "./mock";

describe("array", () => {

    it("Should get lens array by key", () => {
        const lens = getLens();
        const list = lens.array("list");

        expect(list.get())
            .to.be.deep.equal(value.list);
    });

    it("Should get lens array by lambda", () => {
        const lens = getLens();
        const list = lens.array((p) => p.list);

        expect(list.get())
            .to.be.deep.equal(value.list);
    });

    it("Should remove by lens", () => {
        const lens = getLens();
        const list = lens.array("list");
        list.remove(list.item(0));

        const listValue = list.get();
        let name = "";

        if (listValue) {
            name = listValue[0].name;
        }

        expect(name)
            .to.be.equal("two");
    });

    it("Should remove by id ", () => {
        const lens = getLens();
        const list = lens.array("list", "id");
        (list.get() || [])[0].id;
        list.remove(1);

        expect((list.get() || [])[0].name)
            .to.be.equal("two");
    });

    it("Should remove by object reference ", () => {
        const lens = getLens();
        const list = lens.array("list", "id");
        const three = {
            id: 3,
            name: "three",
        };

        list.insert(three);

        expect((list.get() || [])[2].name)
            .to.be.equal(three.name);

        list.remove(three);

        expect((list.get() || [])[0].name)
            .to.be.equal("one");

        expect((list.get() || [])[1].name)
            .to.be.equal("two");

        expect((list.get() || [])[3])
            .to.be.undefined;
    });

    it("Should set to array", () => {
        const lens = getLens();
        const list = lens.array("list");
        list.item(0).prop("name").set("Kate");

        expect(lens.array("list").get())
            .to.be.instanceOf(Array);

        expect(list.item(0).prop("name").get())
            .to.be.equal("Kate");
    });

    it("Should set array to absent parent prop", () => {
        const lens = getLens();
        const objNull = lens.item("objNull");
        const inner = objNull.array("arr").item(0).item("inner");
        inner.set("one");

        expect(objNull.array("arr").get())
            .to.be.instanceOf(Array);

        expect(objNull.array("arr").item(0).item("inner").get())
            .to.be.equal("one");
    });

    it("Should check default array value", () => {
        const lens = getLens();

        const prop = lens.item("objNull");
        const array = prop.array("array");
        const defaultArray = array.defaultValue([{ one: "one" }]);

        expect(array.get())
            .to.be.null;

        expect(array)
            .to.be.not.equal(defaultArray);

        expect(defaultArray.get())
            .to.be.deep.equal([{ one: "one" }]);

        expect(array.get())
            .to.be.null;

        defaultArray.set([{ two: "two" }]);

        expect(defaultArray.get())
            .to.be.deep.equal([{ two: "two" }]);

        expect(array.get())
            .to.be.deep.equal([{ two: "two" }]);
    });

    it("Should check that insert returns the index of the inserted element", () => {
        const lens = getLens();
        let position = lens.array("list").insertMany([{ id: 3, name: "three" }]);

        expect(position)
            .to.be.equal(2);

        lens.prop("list").set([]);

        position = lens.array("list").insertMany([]);

        expect(position)
            .to.be.equal(-1);

        position = lens.array("list").insertMany([{ id: 4, name: "four" }]);

        expect(position)
            .to.be.equal(0);

        position = lens.array("list").insert({ id: 5, name: "five" });

        expect(position)
            .to.be.equal(1);
    });

    it("#find: Should find an item in array", () => {
        const lens = getLens();
        const list = lens.array("list");
        const found = list.find((lensItem, {}, {}, item) => {
            const lensValue = lensItem.get();
            return Boolean(lensValue && lensValue.name === "two" && item.name === "two");
        });

        expect(found).to.exist;
        expect(found && found.get()).to.deep.equal(value.list[1]);
    });

    it("#find: Should return null from array", () => {
        const lens = getLens();
        const emptyArrayLens = lens.array("objNull");

        const found = emptyArrayLens.find((lensItem, {}, {}, item) => {
            const lensValue = lensItem.get();
            return Boolean(lensValue && lensValue.name === "two" && item.name === "two");
        });

        expect(found).to.be.null;
    });

    it("#find: Should return first found item from array", () => {
        const lens = getLens();
        const arrLens = lens.array("list");

        arrLens.insert({...value.list[0], id: 3});

        const found = arrLens.find((lensItem, {}, {}, item) => {
            const lensValue = lensItem.get();
            return Boolean(lensValue && lensValue.name === "one" && item.name === "one");
        });

        expect(found && found.get()).to.deep.equal(value.list[0]);
    });
});
