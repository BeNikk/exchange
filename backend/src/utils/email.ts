import { Resend } from 'resend';
import { emailKey } from './config.ts';

const resend = new Resend(emailKey);
export async function sendEmail(token:string){
  try {
    const emailHTML = `<a>http://localhost:3000/api/v1/signin/post?token=${token}</a>`;
   const { data, error } = await resend.emails.send({
   from: 'Acme <onboarding@resend.dev>',
   to: ['bhatt13nikhil@gmail.com'],
   subject: 'Login to Exchange',
   html: emailHTML,
   replyTo: 'onboarding@resend.dev',
});
    if(data){
      return true;
    }
   return false;
}catch (error) {
  console.log("ERROR IN RESEND EMAIL FUNCTION",error);
    return false;
  }
}

