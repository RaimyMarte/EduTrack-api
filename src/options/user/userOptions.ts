import { UserRole } from "../../models/maintenance"
import { getUserDisplayName } from "../../utils"
import { userAttributes } from "./attributes"

export const userOptions = {
    include: [
        {
            model: UserRole,
            as: 'UserRole',
            attributes: ['Name'],
        },

        getUserDisplayName('UserCreatedBy'),
        getUserDisplayName('UserLastModifiedBy'),
    ],
    attributes: [
        ...userAttributes,
    ],
}
