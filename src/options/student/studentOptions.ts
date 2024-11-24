import { Nationality } from "../../models/maintenance";
import { getUserDisplayName } from "../../utils";

export const studentOptions = {
    include: [
        {
            model: Nationality,
            as: 'Nationality',
            attributes: ['Name'],
        },

        getUserDisplayName('StudentCreatedBy'),
        getUserDisplayName('StudentLastUpdatedBy'),
    ],
}