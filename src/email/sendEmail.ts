import dotenv from 'dotenv'
import fs from 'fs';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
dotenv.config()

interface params {
    to: string,
    subject: string;
    title: string
    text: string
    buttonName?: string
    link?: string
    showButton?: boolean
}

const emailSenderService: string | undefined = process.env.EMAIL_SENDER_SERVICE
const emailSender: string | undefined = process.env.EMAIL_SENDER
const emailSenderPassword: string | undefined = process.env.EMAIL_SENDER_PASSWORD


const createTransporter = () => {
    return nodemailer.createTransport({
        service: emailSenderService,
        auth: {
            user: emailSender,
            pass: emailSenderPassword,
        },
    });
}

// Define email options
export const sendEmail = async ({ to, subject, text, buttonName, link, showButton, title, }: params): Promise<void> => {
    return
    const transporter = createTransporter();

    if (!to) throw Error('The email address has not been found')

    const templatePath = path.join(__dirname, "../templates/emailTemplate.html");
    const source = fs.readFileSync(templatePath, 'utf-8').toString();

    const template = Handlebars.compile(source);
    const replacements = {
        buttonName,
        currentYear: new Date().getFullYear(),
        link,
        showButton,
        text,
        title,
    };

    const htmlToSend = template(replacements);

    const mailOptions = {
        from: emailSender, // Sender's email address
        to: to.toString(), // Recipient's email address
        subject, // Subject of the email
        text, // Email text content
        html: htmlToSend
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions)
    console.log(info)
};
