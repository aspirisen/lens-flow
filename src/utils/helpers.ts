export function clone<T>(item: T | null): T | null {
    if (!item) {
        return item;
    }

    const result: any = Array.isArray(item) ? [] : {};

    for (const key in item) {
        if (item[key]) {
            const v = item[key];
            result[key] = (typeof v === "object") ? clone(v) : v;
        }
    }

    return result;
}
