import fs from 'fs';

const apiBaseUrl: string = process.env.API_BASE_URL || ''

export const deleteFile = (fileName: string) => {
    const fileNameStartIndex = fileName.indexOf(apiBaseUrl) + apiBaseUrl.length;
    const filePath = `.${fileName.substring(fileNameStartIndex)}`;

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return;
        }
        console.log('File deleted successfully');
    })
}