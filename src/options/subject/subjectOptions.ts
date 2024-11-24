import { User } from "../../models/authentication";
import { getUserDisplayName } from "../../utils";

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

        getUserDisplayName('SubjectCreatedBy'),
        getUserDisplayName('SubjectLastUpdatedBy'),
    ],
}