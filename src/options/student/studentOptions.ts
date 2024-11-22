import { getUserDisplayName } from "../../utils";

export const studentOptions = {
    include: [
        getUserDisplayName('StudentCreatedBy'),
        getUserDisplayName('StudentLastUpdatedBy'),
    ],
}