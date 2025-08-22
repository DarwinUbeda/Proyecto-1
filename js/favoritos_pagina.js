import { leerFavoritos, alternarFavorito } from './favoritos.js';
import { obtenerPokemon } from './api.js';
import { tarjetaPokemon } from './ui.js';
import { mostrarCargando, manejarError, formatearNombre } from './utilidades.js';

const contenedor = document.getElementById('lista_favoritos');

// Modal
const modalEl = document.getElementById('modal_detalles');
let instanciaModal;
let grafico;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.bootstrap && modalEl){
    instanciaModal = new bootstrap.Modal(modalEl);
  }
  await cargarFavoritos();

  // Delegación: quitar favoritos y ver detalles
  contenedor.addEventListener('click', async (e) => {
    const btnFav = e.target.closest('[data-accion="favorito"]');
    const btnDet = e.target.closest('[data-accion="detalles"]');

    if(btnFav){
      const nombre = btnFav.dataset.nombre;
      const r = alternarFavorito(nombre);

      // Cambia color y quita la tarjeta si se eliminó
      if(r){
        btnFav.classList.add('favorito-activo');
        if(window.Swal) Swal.fire({toast:true,position:'top-end',timer:1200,showConfirmButton:false,icon:'success',title:'Agregado a favoritos'});
      }else{
        btnFav.classList.remove('favorito-activo');
        const tarjeta = btnFav.closest('.col');
        if(tarjeta) tarjeta.remove();
        if(!contenedor.querySelector('.col')){
          contenedor.innerHTML = '<p class="texto-suave">Aún no tienes favoritos.</p>';
        }
        if(window.Swal) Swal.fire({toast:true,position:'top-end',timer:1200,showConfirmButton:false,icon:'info',title:'Eliminado de favoritos'});
      }
      return;
    }

    if(btnDet){
      const nombre = btnDet.dataset.nombre;
      mostrarDetalles(nombre);
      return;
    }
  });
});

async function cargarFavoritos(){
  try{
    mostrarCargando(true);
    const favoritos = leerFavoritos();
    if(favoritos.length === 0){
      contenedor.innerHTML = '<p class="texto-suave">Aún no tienes favoritos.</p>';
      return;
    }
    const setFavs = new Set(favoritos);
    const tarjetas = await Promise.all(favoritos.map(async (nombre) => {
      const det = await obtenerPokemon(nombre);
      const imagen = det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';
      return tarjetaPokemon({ nombre: det.name, imagen, numero: det.id, esFavorito: setFavs.has(det.name) });
    }));
    contenedor.innerHTML = tarjetas.join('');
  }catch(e){ manejarError(e.message); }
  finally{ mostrarCargando(false); }
}

async function mostrarDetalles(nombre){
  try{
    mostrarCargando(true);
    const det = await obtenerPokemon(nombre);

    document.getElementById('titulo_modal').textContent = formatearNombre(det.name);
    document.getElementById('img_modal').src = det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';
    document.getElementById('peso_modal').textContent = `${det.weight/10} kg`;
    document.getElementById('altura_modal').textContent = `${det.height/10} m`;
    const habilidades = det.abilities.map(a => formatearNombre(a.ability.name)).join(', ');
    document.getElementById('habilidades_modal').textContent = habilidades;

    const etiquetas = det.stats.map(s => formatearNombre(s.stat.name));
    const valores = det.stats.map(s => s.base_stat);
    const ctx = document.getElementById('grafico_estadisticas').getContext('2d');
    if(grafico) grafico.destroy();
    grafico = new Chart(ctx, {
      type: 'bar',
      data: { labels: etiquetas, datasets: [{ label: 'Estadísticas base', data: valores }] },
      options: { responsive:true, plugins:{ legend:{ display:false } } }
    });

    // Estado inicial del botón del modal
    const btnFavModal = document.getElementById('btn_favorito_modal');
    const esFav = new Set(leerFavoritos()).has(det.name);
    actualizarBotonFavModal(btnFavModal, esFav);

    btnFavModal.onclick = () => {
      const r = alternarFavorito(det.name);
      actualizarBotonFavModal(btnFavModal, r);

      // Sincroniza tarjeta en la lista
      const btnEnLista = contenedor.querySelector(`.btn-favorito[data-nombre="${det.name}"]`);
      if(btnEnLista){
        if(r) btnEnLista.classList.add('favorito-activo');
        else{
          btnEnLista.classList.remove('favorito-activo');
          // En favoritos, si se elimina, también quitamos la tarjeta
          const card = btnEnLista.closest('.col');
          if(card) card.remove();
          if(!contenedor.querySelector('.col')){
            contenedor.innerHTML = '<p class="texto-suave">Aún no tienes favoritos.</p>';
          }
        }
      }
      if(window.Swal){
        Swal.fire({toast:true,position:'top-end',timer:1200,showConfirmButton:false,icon:r?'success':'info',title:r?'Agregado a favoritos':'Eliminado de favoritos'});
      }
    };

    if(instanciaModal) instanciaModal.show();
  }catch(e){ manejarError(e.message); }
  finally{ mostrarCargando(false); }
}

function actualizarBotonFavModal(boton, esFavorito){
  boton.textContent = esFavorito ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
  boton.classList.toggle('btn-danger', esFavorito);
  boton.classList.toggle('btn-outline-primary', !esFavorito);
}
