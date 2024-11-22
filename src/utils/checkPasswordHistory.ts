import { UserPaswordHistory } from "../models/authentication";
import bcrypt from 'bcrypt';

export const checkPasswordHistory = async ({ Password, UserId }: { Password: string, UserId: string }) => {
    const userPaswordHistory = await UserPaswordHistory.findAll({
        where: { UserId },
        attributes: ['PasswordHash']
    })

    userPaswordHistory.forEach(({ dataValues }) => {
        const HashedPassword = dataValues?.PasswordHash.toString()
        const passwordExist = bcrypt.compareSync(Password, HashedPassword);

        if (passwordExist) throw Error('Password has been used')
    })
}