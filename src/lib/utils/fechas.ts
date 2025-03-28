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

	//valido si es string y contiene una T quiere decir que viene en formato ISO8601, entonces quito desde la T en adelante
	if (typeof fechaRecibida === 'string' && fechaRecibida.includes('T')) {
		return fechaRecibida.split('T')[0];
	}

	if (typeof fechaRecibida === 'object') {
		//si viene por ejemplo 2025-03-20T00:00:00.000Z puede ser del tipo object, paso a string y retiro desde T en adelante
		const fechaRecibidaISOString = fechaRecibida.toISOString();
		return fechaRecibidaISOString.split('T')[0];
	}

	if (typeof fechaRecibida === 'string' && !fechaRecibida.includes('T')) {
		return dayjs(fechaRecibida).format('DD-MMM-YYYY');
	}

	return fechaRecibida;
};

export const formetearFechaToISO8601 = (fechaRecibida: string | Date) => {
	if (typeof fechaRecibida === 'string') {
		if (!fechaRecibida.includes('T')) {
			return `${fechaRecibida}T00:00:00.000Z`;
		} else {
			return fechaRecibida;
		}
	} else {
		//por ahora no he necesitado otro escenario, se devuelve como esta
		return fechaRecibida;
	}
};

// export const obtenerFechaYHoraActual = () => {
// 	// Obtener la hora actual en UTC, el servidor siempre lo tendrá en UTC pues asi debe ser siempre en los servidores
// 	const timeStampActual = dayjs().utc();

// 	const timeStampUTCMinus5 = timeStampActual.subtract(5, 'hour');

// 	const fechaActual = timeStampUTCMinus5.format('YYYY-MM-DD');
// 	//console.log('fechaActual', fechaActual)
// 	const horaActual = timeStampUTCMinus5.format('HH:mm:ss');
// 	//console.log('horaActual', horaActual)

// 	// Formatear manualmente la fecha y hora en formato ISO 8601 completo, incluyendo la zona horaria
// 	const fechaHoraActualISO8601 = timeStampUTCMinus5.format('YYYY-MM-DDTHH:mm:ssZ');
// 	//console.log('fechaHoraActualISO8601', fechaHoraActualISO8601)

// 	return { fechaActual, horaActual, fechaHoraActualISO8601 };
// };

export const obtenerFechaYHoraActual = () => {
	// Obtener la hora actual en UTC
	const timeStampActual_UTC = dayjs().utc();
	const timeStampActual_UTC_ObjJS = timeStampActual_UTC.toDate();
	const fechaHoraActualISO8601_UTC = timeStampActual_UTC.format('YYYY-MM-DDTHH:mm:ssZ');

	// Obtener la hora actual en la zona horaria de Bogotá
	const timeStampActual_UTCMinus5 = dayjs().utc().subtract(5, 'hour');
	const timeStampActual_UTCMinus5_ObjJS = timeStampActual_UTCMinus5.toDate();

	const fechaActual_UTCMinus5 = timeStampActual_UTCMinus5.format('YYYY-MM-DD');
	const horaActual_UTCMinus5 = timeStampActual_UTCMinus5.format('HH:mm:ss');

	// Formatear en ISO 8601
	const fechaHoraActualISO8601_UTCMinus5 = timeStampActual_UTCMinus5.format('YYYY-MM-DDTHH:mm:ssZ');

	return {
		timeStampActual_UTC,
		timeStampActual_UTC_ObjJS,
		fechaHoraActualISO8601_UTCMinus5,
		timeStampActual_UTCMinus5,
		timeStampActual_UTCMinus5_ObjJS,
		fechaActual_UTCMinus5,
		horaActual_UTCMinus5,
		fechaHoraActualISO8601_UTC,
	};
};
