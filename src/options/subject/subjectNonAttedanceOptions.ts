import { StudentSubjectCross } from "../../models/student";
import { studentSubjectOptions } from "../student/studentSubjectOptions";


export const subjectNonAttedanceOptions = {
    include: [
        {
            model: StudentSubjectCross,
            as: 'StudentSubjectCross',
            ...studentSubjectOptions
        },
    ],
}