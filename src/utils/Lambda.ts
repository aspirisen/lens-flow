export class Lambda {

    // tslint:disable-next-line:ban-types
    public static parse(fn: Function): string[] {
        const parsed = Lambda.lambda.parseFunctionSource(fn.toString());
        return parsed;
    }

    private static lambda = new Lambda();

    private regex = /function\s*(?:[\w\$][\d\w\$]*)?\s*\(\s*(?:[\w\$][\d\w\$]*)\s*\)\s*\{\s*(?:"use strict"\s*;)?\s*return\s*(?:[\w\$][\d\w\$]*)((?:\s*\.\s*[\w\$][\d\w\$]*)+)\s*;?\s*\}/gm;
    private cache: { [key: string]: string[] } = {};

    private parseFunctionSource(source: string): string[] {
        if (this.cache[source]) {
            return this.cache[source];
        } else {
            const result = this.parseProps(source);
            this.cache[source] = result;
            return result;
        }
    }

    private parseProps(source: string): string[] {
        this.regex.lastIndex = 0;
        const matches = this.regex.exec(source);

        if (matches == null || matches.length !== 2) {
            throw new Error(`lambdaParser: Cannot parse function: '${source}'`);
        }

        const props = matches[1].split(".").map((s) => s.trim()).filter((s) => !!s);
        return props;
    }

}
