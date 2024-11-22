import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid'

interface UploadFilesParams {
    req: Request;
    folder: string;
}

export const uploadFiles = async ({ req, folder }: UploadFilesParams) => {
    const { files } = req;


    if (!files || (Array.isArray(files) && files.length === 0))
        throw Error('Files were not uploaded');

    const publicPath: string = './public';

    const savedFiles: string[] = [];

    Object.entries(files).forEach(([key, file]: [string, any]) => {
        const generatedId = uuidv4();

        const fileName: string = file.name;
        const fileExtension: string | undefined = fileName.split('.').pop();
        const savedFile = `${generatedId}-${key}.${fileExtension}`;
        const filePath = `${publicPath}/${folder}/${savedFile}`;

        file.mv(filePath);
        savedFiles.push(savedFile);
    });

    return savedFiles;

}