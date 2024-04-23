import { isJSON } from "class-validator";

export function processObject(target: object | object[],
    {
        ignoreValues = []
    }: {
        ignoreValues?: string[]
    } = {}) {

    return Array.isArray(target)
        ? (() => {
            const newArr = []
            target.forEach((arrObj, i) => {
                newArr[i] = processObject(arrObj, { ignoreValues })
            })
            return newArr
        })()
        : Object.fromEntries(
            Object.entries(target)
                .map(([key, value]) => {
                    value = !ignoreValues.includes(key) ? processValue(value) : value
                    if (Array.isArray(value) || typeof value == 'object') {
                        value = processObject(value, { ignoreValues })
                    }
                    return [key, value]
                })
        )
}

export function processValue(value) {
    if (isJSON(value) || !isNaN(Number(value))) {
        return JSON.parse(value);
    }
    return value;
}