export const validatePassword = (password: string, confirmPassword: string): void => {
    const validationRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!validationRegex.test(password))
        throw Error('The password must have at least eight characters, at least one uppercase letter, one lowercase letter, and one number.');

    if (password !== confirmPassword)
        throw Error('Passwords do not match.');
};
