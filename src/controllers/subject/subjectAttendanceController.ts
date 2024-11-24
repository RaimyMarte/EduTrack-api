import { Request, Response } from "express";
import { Order } from "sequelize";
import { Student, StudentSubjectCross } from "../../models/student";
import { Subject, SubjectNonAttendance } from "../../models/subject";
import { studentSubjectOptions } from "../../options/student/studentSubjectOptions";
import { successResponse } from "../../response";
import { handleUnknownError } from "../../utils";
import { subjectNonAttedanceOptions } from "../../options/subject/subjectNonAttedanceOptions";
import { v4 as uuidv4 } from 'uuid'

const studentOrder: Order = [
    [{ model: Student, as: 'Student' }, 'FirstName', 'ASC'],
    [{ model: Student, as: 'Student' }, 'LastName', 'ASC'],
]

export const getSubjectAttendance = async (req: Request, res: Response): Promise<void> => {
    const { params, query } = req;
    const { date } = query;
    const { subjectId } = params;

    try {
        if (!date) throw Error('Date is required');
        if (!subjectId) throw Error('Subject is required');

        const studentSubjectsCross: any[] = await StudentSubjectCross.findAll({
            where: {
                SubjectId: subjectId,
            },
            ...studentSubjectOptions,
            order: studentOrder,
        });

        const studentSubjectsCrossIds = studentSubjectsCross.map(entry => entry?.Id);

        const nonAttendanceData: any[] = await SubjectNonAttendance.findAll({
            where: {
                StudentSubjectCrossId: studentSubjectsCrossIds,
                Date: date,
            },
            ...subjectNonAttedanceOptions
        });

        const nonAttendanceIds = nonAttendanceData.map(entry => entry.StudentSubjectCrossId);
        const absentStudents = nonAttendanceData.map(entry => entry?.StudentSubjectCross?.Student);

        const presentStudents = studentSubjectsCross.filter(entry => !nonAttendanceIds.includes(entry.Id)).map((entry) => entry?.Student);

        const data = {
            presentStudents,
            absentStudents,
        };

        const { response } = successResponse({ data });
        res.json(response);
    } catch (error) {
        handleUnknownError({ error, res });
    }
};



export const saveSubjectAttendance = async (req: Request, res: Response): Promise<void> => {
    const { PresentStudents = [], AbsentStudents = [], SubjectId, Date }: { PresentStudents: string[], AbsentStudents: string[], SubjectId: string, Date: string } = req.body

    try {
        if (!Date) throw Error('Date is required')
        if (!SubjectId) throw Error('Subject is required')

        const subject = await Subject.findOne({ where: { Id: SubjectId }, attributes: ['Id'] })
        if (!subject) throw Error('Subject was not found')

        const absentStudentsData = await Promise.all(AbsentStudents.map(async (studentId) => {
            const studentSubjectCross = await StudentSubjectCross.findOne({
                where: {
                    SubjectId,
                    StudentId: studentId,
                },
                attributes: ['Id']
            })

            const studentSubjectCrossId = studentSubjectCross?.Id

            const findSubjectNonAttendance = await SubjectNonAttendance.findOne({
                where: {
                    StudentSubjectCrossId: studentSubjectCrossId,
                    Date,
                },
                attributes: ['Id']
            })

            if (findSubjectNonAttendance)
                return

            return {
                Id: uuidv4(),
                Date,
                StudentSubjectCrossId: studentSubjectCrossId,
            }
        }));

        const validAbsentStudentsData = absentStudentsData.filter((data): data is NonNullable<typeof data> => data !== undefined);
        await SubjectNonAttendance.bulkCreate(validAbsentStudentsData);

        const presentStudentSubjectCross = await StudentSubjectCross.findAll({
            where: {
                SubjectId,
                StudentId: PresentStudents,
            },
            attributes: ['Id']
        })

        const presentStudentSubjectCrossIds = presentStudentSubjectCross.map((entry) => entry?.Id);

        await SubjectNonAttendance.destroy({
            where: {
                StudentSubjectCrossId: presentStudentSubjectCrossIds,
                Date,
            }
        });


        const { response } = successResponse({ message: 'Attendance and absences have been successfully recorded for the selected students.' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}