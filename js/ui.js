import { formatearNombre } from './utilidades.js';

export function tarjetaPokemon({ nombre, imagen, numero, esFavorito = false }){
  return `
  <div class="col">
    <div class="card carta h-100 position-relative">
      <button class="btn btn-light btn-sm btn-favorito ${esFavorito ? 'favorito-activo' : ''}" data-accion="favorito" data-nombre="${nombre}" title="Agregar a favoritos">❤️</button>
      <img src="${imagen}" class="card-img-top p-3" alt="${nombre}">
      <div class="card-body">
        <h6 class="card-title mb-1">${nombre.charAt(0).toUpperCase() + nombre.slice(1)}</h6>
        <small class="text-secondary">#${numero}</small>
      </div>
      <div class="card-footer bg-transparent border-0 pb-3">
        <button class="btn btn-outline-info w-100" data-accion="detalles" data-nombre="${nombre}">Ver detalles</button>
      </div>
    </div>
  </div>`;
}



export function botonPaginacion(texto, pagina, activo=false, deshabilitado=false){
  return `<button class="btn ${activo?'btn-primary':'btn-outline-light'}" data-pagina="${pagina}" ${deshabilitado?'disabled':''}>${texto}</button>`;
}
