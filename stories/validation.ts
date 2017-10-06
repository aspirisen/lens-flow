import { Metadata, ValidationState } from "../src/types";

function validateValue<T>(value: T, meta: Metadata<T>): any {
    if (meta.isRequired) {
        if (value == null
            || (typeof value === "string" && value.trim() === "")
            || (Array.isArray(value) && value.length === 0)
        ) {
            return {
                isValid: false,
                message: "The field is mandatory",
            };
        }
    }

    if (meta.minValue != null && value != null && value < meta.minValue) {
        return {
            isValid: false,
            message: `Value should not be less than ${meta.minValue}`,
        };
    }

    if (meta.maxValue != null && value != null && value > meta.maxValue) {
        return {
            isValid: false,
            message: `Value should not be greater than ${meta.maxValue}`,
        };
    }

    if (meta.maxLength != null && value != null && (value as any).length > meta.maxLength) {
        return {
            isValid: false,
            message: `Maximum length is ${meta.maxLength} characters`,
        };
    }

    if (meta.customValidators) {
        const customValidationMessages = meta.customValidators
            .map((validator: any) => validator(value))
            .reduce((a: any, b: any) => a.concat(b), [])
            .filter((msg: any) => !!msg);

        if (customValidationMessages.length > 0) {
            return {
                isValid: false,
                message: customValidationMessages[0],
            };
        }
    }

    return {
        isValid: true,
    };
}

function validateItem(key: any, value: any, meta: any, parentResult: any) {
    const valueResult = validateValue(value, meta);
    const recursiveResult = validate(value, meta) as any;

    recursiveResult.isValid = recursiveResult.isValid && valueResult.isValid;

    if (valueResult.message) {
        recursiveResult.message = valueResult.message;
    }

    parentResult.props = parentResult.props || {};
    parentResult.props[key] = recursiveResult;
    parentResult.isValid = parentResult.isValid && recursiveResult.isValid;
}

export function validate<T>(value: T, meta: Metadata<T>): ValidationState {
    let result: ValidationState = { isValid: true };

    if (meta.props) {
        for (const key in meta.props) {
            if (meta.props[key]) {
                const childMeta = meta.props[key];

                if (childMeta) {
                    validateItem(key, value && value[key], childMeta, result);
                }
            }
        }
    } else {
        result = validateValue(value, meta);
    }

    if (meta.all && value != null) {
        for (const key in Object.keys(value)) {
            if ((value as any)[key]) {
                validateItem(key, (value as any)[key], meta.all, result);
            }
        }
    }

    return result;
}
