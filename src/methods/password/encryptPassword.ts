import bcrypt from 'bcrypt';
export const encryptPassword = (password: string) => {
    // Generate a salt
    const saltRounds: number = 10;
    const saltPassword: string = bcrypt.genSaltSync(saltRounds);

    // Generate a hash
    const hashPassword: string = bcrypt.hashSync(password, saltPassword);

    return {
        saltPassword,
        hashPassword
    }
}
