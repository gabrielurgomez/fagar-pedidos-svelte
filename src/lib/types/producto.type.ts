//el producto como está en la BD de admon
export type ProductoConsultado = {
	id: number;
	nombre: string;
	cantidadEnvases: number;
	tipoAceite: string | null; //puede ser null por que los productos de tipo externo no llevan peso
	peso: number;
};

//el producto como está agregado al pedido como tal, se omite cantidadEnvases de ProductoConsultado por que allá la BD siempre es number
//pero aca en pedido puede ser null ya que un pedido puede tener productos de tipo externo que no llevan cantidadEnvases
export type ProductoAgregadoAlPedido = Omit<ProductoConsultado, 'cantidadEnvases'> & {
	cantidadEnvases?: number | null;
	cantidad: number; //puede ser null por que los productos de tipo externo no llevan cantidadEnvases
	valor: number;
	tipo: string;
};

export type ProductoExternoConsultado = {
	id: number;
	nombre: string;
	peso: number;
	existencias: number;
};
