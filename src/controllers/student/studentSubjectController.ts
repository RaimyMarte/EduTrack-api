import { Request, Response } from "express"
import { v4 as uuidv4 } from 'uuid'
import { Student, StudentSubjectCross } from "../../models/student"
import { successResponse } from "../../response"
import { handleUnknownError } from "../../utils"
import { studentSubjectOptions } from "../../options/student/studentSubjectOptions"
import { studentSmallAttributes } from "../../options/student/attributes/studentSmallAttributes"


export const getEnrolledStudents = async (subjectId: string) => {
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

        const enrolledStudents = getEnrolledStudents(subjectId)

        const { response } = successResponse({ data: enrolledStudents });
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



export const addStudentsToSubject = async (req: Request, res: Response): Promise<void> => {
    const { user } = req
    const { Students = [], SubjectId, }: { Students: string[], SubjectId: string, } = req.body

    try {
        if (!Students || (Array.isArray(Students) && Students.length < 1)) throw new Error('You need to select at least one student')
        if (!SubjectId) throw new Error('Subject is required')

        const studentsData = await Promise.all(Students.map(async (studentId) => {
            const findStudentSubjectCross = await StudentSubjectCross.findOne({
                where: {
                    SubjectId,
                    StudentId: studentId,
                }
            })

            if (findStudentSubjectCross) throw new Error('Student is already in this section')

            return {
                SubjectId,
                CreatedBy: user?.Id,
                Id: uuidv4(),
                StudentId: studentId,
            }
        }));

        const data = await StudentSubjectCross.bulkCreate(studentsData);

        const { response } = successResponse({ data, message: 'Students added successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}

export const removeStudentsFromSubject = async (req: Request, res: Response): Promise<void> => {
    const { Students = [], SubjectId, }: { Students: string[], SubjectId: string, } = req.body

    try {
        if (!Students || (Array.isArray(Students) && Students.length < 1)) throw new Error('You need to select at least one student')
        if (!SubjectId) throw new Error('Subject is required')

        Students.forEach(async (studentId) => {
            await StudentSubjectCross.destroy({
                where: {
                    SubjectId,
                    StudentId: studentId,
                }
            })
        })

        const { response } = successResponse({ message: 'Students removed successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}