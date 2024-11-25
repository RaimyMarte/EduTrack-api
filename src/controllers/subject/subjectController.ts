import { Request, Response } from "express"
import { Op } from "sequelize"
import { createHandler, deleteByIdHandler, getByIdHandler, paginationSearchHandler, updateByIdHandler } from "../../methods/request"
import { Subject } from "../../models/subject"
import { subjectOptions } from "../../options/subject/subjectOptions"


export const subjectGetAllWithPagination = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user, query } = req
        const userRoleId = user?.UserRoleId

        const isUserAdmin = userRoleId == 1
        const isUserProfessor = userRoleId == 2


        const extraWhereConditions = isUserProfessor
            ? { ProfessorId: user?.Id }
            : {}

        if (!isUserAdmin && !isUserProfessor)
            throw new Error('You are not allow to do this');

        const { search } = query;

        const searchParameters = [
            { Name: { [Op.like]: `%${search}%` } },
            { Code: { [Op.like]: `%${search}%` } },
        ]

        await paginationSearchHandler({
            req,
            res,
            model: Subject,
            searchParameters,
            extraWhereConditions,
                options: {
                ...subjectOptions,
                order: [['CreatedDate', 'DESC']],
            },
        })
    } catch (error) {

    }

}


export const getSubjectById = async (req: Request, res: Response): Promise<void> => getByIdHandler({ req, res, model: Subject, options: subjectOptions })

export const createsubject = async (req: Request, res: Response): Promise<void> => await createHandler({ req, res, model: Subject, idType: 'uuid' })

export const updatesubject = async (req: Request, res: Response): Promise<void> => await updateByIdHandler({ req, res, model: Subject })

export const deleteSubject = async (req: Request, res: Response): Promise<void> => await deleteByIdHandler({ req, res, model: Subject })