import nodemailer from 'nodemailer'



const sendEmailService= async (
    {
      to =' ' ,
      subject = 'no replay', 
      message='<h1>no message</h1>',
      attachments=[]
    })=>{

    // set email configurations
    const transporter=nodemailer.createTransport({
        host:'localhost',
        service:'gmail',
        port:587,
        secure:false,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASSWORD
        }

    })

    const info = await transporter.sendMail({
        from: `"Fred Foo 👻" ${process.env.EMAIL}`, // sender address
        to, // list of receivers
        subject, // Subject line
        html:message, // html body
        attachments
      })
      return info.accepted.length ? true : false
}


export default sendEmailService