import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

function obtenerFechaYHoraActual() {
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
}

function formearFechaISO8601(fecha: string) {
    const fechaHoraActual = dayjs(fecha).utc().format('YYYY-MM-DDTHH:mm:ssZ');
    return fechaHoraActual;

}

/*
function calcularDiferenciaDias(fechaIngreso: string, fechaSalida: string) {
    const ingreso = new Date(fechaIngreso);
    const salida = new Date(fechaSalida);
    const diferenciaTiempo = salida.getTime() - ingreso.getTime();
    const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
    return diferenciaDias;
}*/

export { obtenerFechaYHoraActual, formearFechaISO8601/*, calcularDiferenciaDias*/ };



