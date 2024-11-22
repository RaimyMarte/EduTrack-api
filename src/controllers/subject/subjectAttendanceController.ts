import { Request, Response } from "express";
import { Op, Order } from "sequelize";
import { Student, StudentSubjectCross } from "../../models/student";
import { studentSubjectOptions } from "../../options/student/studentSubjectOptions";
import { successResponse } from "../../response";
import { handleUnknownError } from "../../utils";
import { Subject, SubjectNonAttendance } from "../../models/subject";

const studentOrder: Order = [
    [{ model: Student, as: 'Student' }, 'LastName', 'ASC'],
    [{ model: Student, as: 'Student' }, 'FirstName', 'ASC'],
]

export const getSubjectAttendance = async (req: Request, res: Response): Promise<void> => {
    const { params, query } = req;
    const { date } = query;
    const { subjectId } = params;

    try {
        if (!date) throw Error('Date is required');
        if (!subjectId) throw Error('Subject is required');

        const studentSubjectsCross = await StudentSubjectCross.findAll({
            where: {
                SubjectId: subjectId,
            },
            ...studentSubjectOptions,
            order: studentOrder,
        });

        const studentSubjectsCrossIds = studentSubjectsCross.map(entry => entry?.Id);

        const nonAttendanceData = await SubjectNonAttendance.findAll({
            where: {
                StudentSubjectCrossId: {
                    [Op.in]: studentSubjectsCrossIds,
                },
                Date: date,
            }
        });

        const nonAttendanceIds = nonAttendanceData.map(entry => entry.StudentSubjectCrossId);

        const attendanceData = studentSubjectsCross.filter(entry => !nonAttendanceIds.includes(entry.Id));

        const data = {
            attendance: attendanceData,
            nonAttendance: nonAttendanceData,
        };

        const { response } = successResponse({ data });
        res.json(response);
    } catch (error) {
        handleUnknownError({ error, res });
    }
};



export const recordStudentAbsences = async (req: Request, res: Response): Promise<void> => {
    const { Students = [], SubjectId, Date }: { Students: string[], SubjectId: string, Date: string } = req.body

    try {
        if (!Students || (Array.isArray(Students) && Students.length < 1)) throw Error('You need to select at least one student')
        if (!Date) throw Error('Date is required')
        if (!SubjectId) throw Error('Subject is required')

        const section = await Subject.findOne({ where: { Id: SubjectId }, attributes: ['Id'] })
        if (!section) throw Error('Subject was not found')

        const students = Students.map(studentId => ({
            StudentId: studentId,
            SubjectId,
            Date,
        }));

        await SubjectNonAttendance.bulkCreate(students);

        const { response } = successResponse({ title: 'Update students attendance', message: 'Absences successfully recorded for selected students.' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}

export const updateStudentAttendance = async (req: Request, res: Response): Promise<void> => {
    const { Students = [], SubjectId, Date }: { Students: string[], SubjectId: string, Date: string } = req.body

    try {
        if (!Students || (Array.isArray(Students) && Students.length < 1)) throw Error('You need to select at least one student')
        if (!Date) throw Error('Date is required')
        if (!SubjectId) throw Error('Subject is required')

        const subject = await Subject.findOne({ where: { Id: SubjectId }, attributes: ['Id'] })
        if (!subject) throw Error('Subject was not found')

        await SubjectNonAttendance.destroy({
            where: {
                StudentId: Students,
                Date,
                SubjectId,
            }
        });

        const { response } = successResponse({ title: 'Update students attendance', message: 'Attendance successfully updated for selected students.' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}