import { Request, Response } from "express"
import { Op } from "sequelize"
import { sequelize } from "../../database/db"
import { createHandler, deleteByIdHandler, getByIdHandler, paginationSearchHandler, updateByIdHandler } from "../../methods/request"
import { Student } from "../../models/student/studentModel"
import { studentOptions } from "../../options/student/studentOptions"
import { successResponse } from "../../response"
import { handleUnknownError } from "../../utils"
import { deleteFile } from "../files"
import { uploadFiles } from "../files/uploadFilesController"

const apiBaseUrl: string = process.env.API_BASE_URL || ''


interface StudentFilterOptions {
    firstName?: string;
    lastName?: string;
    gender?: string;
    nationalityId?: number;
    code?: string
    phoneNumber?: string
    emailAddress?: string
    parentName?: string
}

const filterStudents = (filters: StudentFilterOptions) => {
    const whereClause: Record<string, any> = {};

    if (filters?.firstName) {
        whereClause.FirstName = { [Op.like]: `%${filters?.firstName}%` };
    }

    if (filters?.lastName) {
        whereClause.LastName = { [Op.like]: `%${filters?.lastName}%` };
    }

    if (filters?.code) {
        whereClause.Code = { [Op.like]: `%${filters?.code}%` };
    }

    if (filters?.phoneNumber) {
        whereClause.PhoneNumber = { [Op.like]: `%${filters?.phoneNumber}%` };
    }

    if (filters?.emailAddress) {
        whereClause.EmailAddress = { [Op.like]: `%${filters?.emailAddress}%` };
    }

    if (filters?.parentName) {
        whereClause.ParentName = { [Op.like]: `%${filters?.parentName}%` };
    }

    if (filters?.gender) {
        whereClause.Gender = filters?.gender;
    }

    if (filters?.nationalityId !== undefined) {
        whereClause.NationalityId = filters?.nationalityId;
    }

    return whereClause;
};

export const studentGetAllWithPagination = async (req: Request, res: Response): Promise<void> => {
    const {
        search,
        firstName,
        lastName,
        gender,
        nationalityId,
        code,
        phoneNumber,
        emailAddress,
        parentName,
    } = req.query as Partial<StudentFilterOptions & { search: string }>;

    const searchParameters = [
        { FirstName: { [Op.like]: `%${search}%` } },
        { LastName: { [Op.like]: `%${search}%` } },
        { EmailAddress: { [Op.like]: `%${search}%` } },
        { PhoneNumber: { [Op.like]: `%${search}%` } },
        { Code: { [Op.like]: `%${search}%` } },
    ];

    const extraWhereConditions = filterStudents({
        firstName,
        lastName,
        gender,
        nationalityId,
        code,
        phoneNumber,
        emailAddress,
        parentName,
    });

    await paginationSearchHandler({
        req,
        res,
        model: Student,
        searchParameters,
        extraWhereConditions,
        options: {
            ...studentOptions,
            order: [['CreatedDate', 'DESC']],
        },
    });
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => await getByIdHandler({ req, res, model: Student, options: studentOptions })

export const createStudent = async (req: Request, res: Response): Promise<void> => await createHandler({ req, res, model: Student, idType: 'uuid' })

export const updateStudent = async (req: Request, res: Response): Promise<void> => await updateByIdHandler({ req, res, model: Student })

export const deleteStudent = async (req: Request, res: Response): Promise<void> => await deleteByIdHandler({ req, res, model: Student })

export const uploadStudentPicture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { params, userToken } = req;
        const { studentId } = params;

        const student = await Student.findOne({ where: { Id: studentId }, attributes: ['Id', 'Picture'] })
        if (!student) throw Error('Student does not exist')

        if (student?.Picture) deleteFile(student?.Picture)

        const savedFile = await uploadFiles({ req, folder: 'students' });

        const updateData: Record<string, any> = {
            Picture: `${apiBaseUrl}/public/students/${savedFile[0]}`,
            LastUpdatedBy: userToken?.UserId,
            LastUpdatedDate: sequelize.literal('CURRENT_TIMESTAMP'),
        };

        const updatedStudent = await Student.update(updateData, { where: { Id: studentId } });

        const { response } = successResponse({ data: updatedStudent, message: 'Student Picture was uploaded successfully' });
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to upload student picture' })
    }
}