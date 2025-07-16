export const isEmailFormat = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test (value);
};

export const forIdentifier = (value: string): boolean => {
    const isEmail = isEmailFormat (value);
    const isUsername = value.length >= 3;

    return isEmail || isUsername;
};