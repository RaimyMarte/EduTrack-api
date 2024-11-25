import { Request, Response } from "express"
import { Op } from "sequelize"
import { User } from "../../models/authentication"
import { Student, StudentSubjectCross } from "../../models/student"
import { Subject } from "../../models/subject"
import { successResponse } from "../../response"
import { handleUnknownError } from "../../utils"


export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const totalStudents = await Student.count();
        const totalUsers = await User.count();
        const totalSubjects = await Subject.count();
        const totalProfessors = await User.count({
            where: {
                UserRoleId: 2
            }
        });

        const data = {
            totalStudents,
            totalUsers,
            totalSubjects,
            totalProfessors,
        }
        const { response } = successResponse({ data });
        res.json(response);
    } catch (error) {
        handleUnknownError({ error, res });
    }
};


export const getProfessorStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const professorId = req.user?.Id;

        const subjects = await Subject.findAll({
            where: { ProfessorId: professorId },
        });

        const subjectStats = await Promise.all(subjects.map(async (subject) => {
            const subjectId = subject?.Id

            const totalStudents = await StudentSubjectCross.count({
                where: { SubjectId: subjectId }
            });

            const gradeData = await StudentSubjectCross.findAll({
                where: {
                    SubjectId: subjectId,
                    Grade: { [Op.not]: null }
                },
                raw: true
            });

            const total = gradeData.reduce((sum, record: any) => sum + parseFloat(record.Grade), 0);
            const average = total / gradeData.length;


            return {
                name: subject?.Name,
                enrolledStudents: totalStudents,
                averageGrade: average,
            };
        }));

        const data = {
            subjectStats
        };

        const { response } = successResponse({ data });
        res.json(response);
    } catch (error) {
        handleUnknownError({ error, res });
    }
};