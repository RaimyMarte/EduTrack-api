import { ClientResponse } from "./clientResponse";

interface ErrorResponse {
    title: string | null;
    message: string | null;
    data: any | null;
    isSuccess: boolean;
}

const response = new ClientResponse();

const defaultTitle: string = 'The action could not be performed.'
const defaultMessage: string = "Sorry, your request could not be completed."

export const errorResponse = ({ title, message, }: { title?: string, message?: string, }): { response: ErrorResponse } => {
    response.title = title ? title : defaultTitle
    response.data = null;
    response.isSuccess = false
    response.message = message ? message : defaultMessage

    return {
        response
    }
}