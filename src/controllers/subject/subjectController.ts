import { Request, Response } from "express"
import { Op } from "sequelize"
import { createHandler, deleteByIdHandler, paginationSearchHandler, updateByIdHandler } from "../../methods/request"
import { Subject } from "../../models/subject"
import { subjectOptions } from "../../options/subject/subjectOptions"


export const subjectGetAllWithPagination = async (req: Request, res: Response): Promise<void> => {
    const { search } = req.query;

    const searchParameters = [
        { Name: { [Op.like]: `%${search}%` } },
        { Code: { [Op.like]: `%${search}%` } },
    ]

    await paginationSearchHandler({
        req,
        res,
        model: Subject,
        searchParameters,
        options: {
            ...subjectOptions,
            order: [['CreatedDate', 'DESC']],
        },
    })
}

export const createsubject = async (req: Request, res: Response): Promise<void> => await createHandler({ req, res, model: Subject, idType: 'uuid' })

export const updatesubject = async (req: Request, res: Response): Promise<void> => await updateByIdHandler({ req, res, model: Subject })

export const deleteSubject = async (req: Request, res: Response): Promise<void> => await deleteByIdHandler({ req, res, model: Subject })