import { Request, Response } from "express"
import { Op } from "sequelize"
import { sequelize } from "../../database/db"
import { createHandler, deleteByIdHandler, getAllHandler, getByIdHandler, paginationSearchHandler, updateByIdHandler } from "../../methods/request"
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
    minAge?: number;
    maxAge?: number;
    nationalityId?: number;
    createdBefore?: Date;
    createdAfter?: Date;
}

const calculateDateOfBirthRange = (minAge?: number, maxAge?: number): Record<string, Date> | undefined => {
    const today = new Date();
    const dateRange: Record<symbol, Date> = {};

    if (minAge !== undefined) {
        const maxDateOfBirth = new Date(
            today.getFullYear() - minAge,
            today.getMonth(),
            today.getDate()
        );
        dateRange[Op.lte] = maxDateOfBirth;
    }

    if (maxAge !== undefined) {
        const minDateOfBirth = new Date(
            today.getFullYear() - maxAge - 1,
            today.getMonth(),
            today.getDate()
        );
        dateRange[Op.gte] = minDateOfBirth;
    }

    return Object.keys(dateRange).length ? dateRange : undefined;
};

export const filterStudents = async (filters: StudentFilterOptions) => {
    const whereClause: Record<string, any> = {};

    if (filters?.firstName) {
        whereClause.FirstName = { [Op.like]: `%${filters?.firstName}%` };
    }

    if (filters?.lastName) {
        whereClause.LastName = { [Op.like]: `%${filters?.lastName}%` };
    }

    if (filters?.gender) {
        whereClause.Gender = filters?.gender;
    }

    if (filters?.nationalityId !== undefined) {
        whereClause.NationalityId = filters?.nationalityId;
    }

    if (filters?.createdBefore || filters?.createdAfter) {
        whereClause.CreatedDate = {};
        if (filters?.createdBefore) {
            whereClause.CreatedDate[Op.lte] = filters?.createdBefore;
        }
        if (filters?.createdAfter) {
            whereClause.CreatedDate[Op.gte] = filters?.createdAfter;
        }
    }

    const dateOfBirthRange = calculateDateOfBirthRange(filters?.minAge, filters?.maxAge);
    if (dateOfBirthRange) {
        whereClause.DateOfBirth = dateOfBirthRange;
    }

    return whereClause;
};

export const studentGetAllWithPagination = async (req: Request, res: Response): Promise<void> => {
    const {
        search,
        firstName,
        lastName,
        gender,
        minAge,
        maxAge,
        createdBefore,
        createdAfter,
    } = req.query as Partial<StudentFilterOptions & { search: string }>;


    const searchParameters = [
        { FirstName: { [Op.like]: `%${search}%` } },
        { LastName: { [Op.like]: `%${search}%` } },
        { EmailAddress: { [Op.like]: `%${search}%` } },
        { PhoneNumber: { [Op.like]: `%${search}%` } },
        { Code: { [Op.like]: `%${search}%` } },
    ]

    const extraWhereConditions = filterStudents({
        firstName,
        lastName,
        gender,
        minAge,
        maxAge,
        createdBefore,
        createdAfter,
    })

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
    })
}


export const getStudentsDropdown = async (_req: Request, res: Response): Promise<void> => await getAllHandler({
    res,
    model: Student,
    options: {
        attributes: [
            'Id',
            'Code',
            'FirstName',
            'MiddleName',
            'LastName',
            'FullName',
            'Picture',
        ]
    }
})


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