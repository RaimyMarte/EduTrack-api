import { ClientResponse } from "./clientResponse";

interface successResponse {
    title: string | null;
    message: string | null;
    data: object | Array<object> | null;
    isSuccess: boolean;
}

interface successParameters {
    title?: string
    message?: string
    total?: number | null
    data?: object | Array<object> | null
}

const response = new ClientResponse();

const defaultTitle = 'Action performed.'
const defaultMessage = "Request completed successfully."

export const successResponse = ({ title, message, data = null, total }: successParameters): { response: successResponse } => {
    response.title = title ? title : defaultTitle
    response.data = data;
    response.isSuccess = true
    response.message = message ? message : defaultMessage
    response.total = total || 0

    return {
        response
    }
}