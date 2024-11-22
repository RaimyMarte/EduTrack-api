import { User } from "../../models/authentication";

export const subjectOptions = {
    include: [
        {
            model: User,
            as: 'Professor',
            attributes: [
                'FirstName',
                'FullName',
                'LastName',
            ],
        },
    ],
}