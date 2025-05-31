import nodemailer from 'nodemailer';

const transporterSistemas = nodemailer.createTransport({
	host: 'smtppro.zoho.com',
	port: 465,
	secure: true,
	auth: { user: 'sistemas@fagarcomercial.com', pass: 'qReYbx9Er2f3' },
});

export { transporterSistemas };
