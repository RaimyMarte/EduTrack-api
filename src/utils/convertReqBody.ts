const convertEmptyStringToNull = (value: string) => {
    return value === '' ? null : value;
};

export const convertReqBody = (body: object) => {
    return Object.fromEntries(
        Object.entries(body).map(([key, value]: [string, string]) => [key, convertEmptyStringToNull(value)])
    );
};
