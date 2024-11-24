import { Request, Response } from "express"
import { v4 as uuidv4 } from 'uuid'
import { Student, StudentSubjectCross } from "../../models/student"
import { successResponse } from "../../response"
import { handleUnknownError } from "../../utils"
import { studentSubjectOptions } from "../../options/student/studentSubjectOptions"
import { studentSmallAttributes } from "../../options/student/attributes/studentSmallAttributes"


const getEnrolledStudents = async (subjectId: string) => {
    const enrolledStudents = await StudentSubjectCross.findAll({
        where: {
            SubjectId: subjectId,
        },
        ...studentSubjectOptions
    });

    return enrolledStudents;
};


export const getStudentsInSubject = async (req: Request, res: Response): Promise<void> => {
    const { subjectId } = req.params;

    try {
        if (!subjectId) throw new Error('Subject is required');

        const enrolledStudents: any = await getEnrolledStudents(subjectId)
        const data = enrolledStudents?.map((item: any) => item?.Student)

        const { response } = successResponse({ data });
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res });
    }
};

export const getStudentsNotEnrolled = async (req: Request, res: Response): Promise<void> => {
    const { subjectId } = req.params;

    try {
        if (!subjectId) throw new Error('Subject is required');

        const allStudents = await Student.findAll({ attributes: studentSmallAttributes });

        const enrolledStudents = await getEnrolledStudents(subjectId);
        const enrolledStudensIds = enrolledStudents.map((entry) => entry?.StudentId)

        const notEnrolledStudents = allStudents.filter((student) => !enrolledStudensIds.includes(student?.Id));

        const { response } = successResponse({ data: notEnrolledStudents });
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res });
    }
};

export const saveSubjectEnrollment = async (req: Request, res: Response): Promise<void> => {
    const { user } = req
    const { EnrollStudents = [], NotEnrollStudents = [], SubjectId, }: { EnrollStudents: string[], NotEnrollStudents: string[], SubjectId: string, } = req.body

    try {

        if (!SubjectId) throw new Error('Subject is required')

        const enrollStudentsData = await Promise.all(EnrollStudents.map(async (studentId) => {
            const findStudentSubjectCross = await StudentSubjectCross.findOne({
                where: {
                    SubjectId,
                    StudentId: studentId,
                }
            })

            if (findStudentSubjectCross)
                return

            return {
                SubjectId,
                CreatedBy: user?.Id,
                Id: uuidv4(),
                StudentId: studentId,
            }
        }));

        const validEnrollStudentsData = enrollStudentsData.filter((data) => data !== undefined);

        await StudentSubjectCross.bulkCreate(validEnrollStudentsData);

        NotEnrollStudents.forEach(async (studentId) => {
            await StudentSubjectCross.destroy({
                where: {
                    SubjectId,
                    StudentId: studentId,
                }
            })
        })

        const { response } = successResponse({ message: 'Students enrollment updated successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}