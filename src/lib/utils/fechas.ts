import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import 'dayjs/locale/es';
dayjs.locale('es');

//transforma de 2024-02-14T00:00:00.000Z a 2025-02-14
export const formatearFechaISO8601aYYYYMMDD = (fechaISO: string | Date) => {
	return dayjs.utc(fechaISO).format('YYYY-MM-DD');
};

export const formatearFechaDDMMMYYYY = (fechaRecibida: string | Date | null) => {
	if (fechaRecibida === null) {
		return null;
	}
	if (typeof fechaRecibida === 'string') {
		return dayjs(fechaRecibida).format('DD/MMM/YYYY');
	}

	if (typeof fechaRecibida === 'object') {
		const year = fechaRecibida.getFullYear();
		const month = String(fechaRecibida.getMonth() + 1).padStart(2, '0');
		const day = String(fechaRecibida.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
};

export const obtenerFechaYHoraActual = () => {
	// Obtener la hora actual en UTC, el servidor siempre lo tendrá en UTC pues asi debe ser siempre en los servidores
	const timeStampActual = dayjs().utc();

	const timeStampUTCMinus5 = timeStampActual.subtract(5, 'hour');

	const fechaActual = timeStampUTCMinus5.format('YYYY-MM-DD');
	//console.log('fechaActual', fechaActual)
	const horaActual = timeStampUTCMinus5.format('HH:mm:ss');
	//console.log('horaActual', horaActual)

	// Formatear manualmente la fecha y hora en formato ISO 8601 completo, incluyendo la zona horaria
	const fechaHoraActualISO8601 = timeStampUTCMinus5.format('YYYY-MM-DDTHH:mm:ssZ');
	//console.log('fechaHoraActualISO8601', fechaHoraActualISO8601)

	return { fechaActual, horaActual, fechaHoraActualISO8601 };
};
