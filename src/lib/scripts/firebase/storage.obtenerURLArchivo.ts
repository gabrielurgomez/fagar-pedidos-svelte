import { ref, getDownloadURL } from "firebase/storage";
import { storage } from '../../../firebase';


const obtenerURLArchivo = async function (ruta: string): Promise<string> {

  //console.log('se consultará el archivo de la ruta', ruta)
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, ruta);
    getDownloadURL(storageRef).then((downloadURL) => {
      //console.log('archivo encontrado, se obtiene la URL', downloadURL)
      resolve(downloadURL);
    }).catch((error) => {
      console.log('scripts/storage.obtenerURLArchivo.ts, obtenerURLArchivo() => catch(error) =>', error.code)
      if (error.code === 'storage/object-not-found') {
        resolve('archivo no existe');
      }
      reject(error);
    });
  });
};

export { obtenerURLArchivo };