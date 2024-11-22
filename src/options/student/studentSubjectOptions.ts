import { Student } from "../../models/student";
import { studentSmallAttributes } from "./attributes/studentSmallAttributes";

export const studentSubjectOptions = {
    include: [
        {
            model: Student,
            as: 'Student',
            attributes: studentSmallAttributes,
        },
    ],
}