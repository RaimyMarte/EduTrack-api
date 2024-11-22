import { Response } from "express";
import { errorResponse } from "../response";

interface HandleUnknownError {
  error: unknown
  res: Response
  title?: string
  statusCode?: number
}

export const handleUnknownError = ({ error, res, title, statusCode }: HandleUnknownError): void => {
  if (error instanceof Error) {
    console.log(error)
    // The error is an instance of the Error class
    const { response } = errorResponse({ title, message: error.message, statusCode });
    res.json(response);
  } else {
    // Handle other unknown error types or scenarios
    res.status(500).json({ message: 'Internal server error' });
  }
};