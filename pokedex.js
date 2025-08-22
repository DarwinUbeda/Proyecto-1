import { obtenerListaPokemon, obtenerPokemon, obtenerTipos, obtenerPorTipo, obtenerHabilidadES } from './api.js';
import { tarjetaPokemon, botonPaginacion } from './ui.js';
import { Paginador } from './paginacion.js';
import { mostrarCargando, manejarError, formatearNombre, traducirTipoES, traducirStatES, capitalizarFrase } from './utilidades.js';
import { alternarFavorito, leerFavoritos } from './favoritos.js';


const contenedorLista = document.getElementById('contenedor_lista');
const contenedorPaginacion = document.getElementById('contenedor_paginacion');
const selectorTipo = document.getElementById('selector_tipo');
const formBusqueda = document.getElementById('form_busqueda');
const entradaBusqueda = document.getElementById('entrada_busqueda');

// Modal
const modalEl = document.getElementById('modal_detalles');
let instanciaModal;
let grafico; // Chart.js

const paginador = new Paginador({ limite: 20, totalEstimado: 1302 });

document.addEventListener('DOMContentLoaded', inicializar);

async function inicializar(){
  // Instancia de modal (Bootstrap)
  if (window.bootstrap && modalEl){
    instanciaModal = new bootstrap.Modal(modalEl);
  }

  await cargarTipos();
  await cargarPagina();

  contenedorLista.addEventListener('click', manejarClickLista);
  contenedorPaginacion.addEventListener('click', manejarClickPaginacion);
  selectorTipo.addEventListener('change', filtrarPorTipo);
  formBusqueda.addEventListener('submit', buscarPorNombre);
}

async function cargarTipos(){
  try{
    const tipos = await obtenerTipos();
   selectorTipo.innerHTML = '<option value="">Todos</option>' +
  tipos.map(t => `<option value="${t.name}">${traducirTipoES(t.name)}</option>`).join('');
  }catch(e){ manejarError(e.message); }
}

async function cargarPagina(){
  try{
    mostrarCargando(true);
    const { results } = await obtenerListaPokemon(paginador.offset, paginador.limite);
    const setFavs = new Set(leerFavoritos());

    const tarjetas = await Promise.all(results.map(async (p) => {
      const det = await obtenerPokemon(p.name);
      const imagen = det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';
      return tarjetaPokemon({ nombre: det.name, imagen, numero: det.id, esFavorito: setFavs.has(det.name) });
    }));

    contenedorLista.innerHTML = tarjetas.join('');
    renderizarPaginacion();
  }catch(e){
    manejarError(e.message);
  }finally{
    mostrarCargando(false);
  }
}

function renderizarPaginacion(){
  const botones = [];
  const total = paginador.totalPaginas;
  const actual = paginador.pagina;

  botones.push(botonPaginacion('«', 1, false, actual === 1));
  botones.push(botonPaginacion('‹', actual - 1, false, actual === 1));

  const inicio = Math.max(1, actual - 2);
  const fin = Math.min(total, actual + 2);
  for(let p = inicio; p <= fin; p++){
    botones.push(botonPaginacion(String(p), p, p === actual));
  }

  botones.push(botonPaginacion('›', actual + 1, false, actual === total));
  botones.push(botonPaginacion('»', total, false, actual === total));

  contenedorPaginacion.innerHTML = botones.join('');
}

function manejarClickPaginacion(e){
  const btn = e.target.closest('button[data-pagina]');
  if(!btn) return;
  const pagina = parseInt(btn.dataset.pagina, 10);
  paginador.setPagina(pagina);
  cargarPagina();
}

async function filtrarPorTipo(){
  const tipo = selectorTipo.value;
  if(!tipo){
    paginador.setPagina(1);
    return cargarPagina();
  }
  try{
    mostrarCargando(true);
    const data = await obtenerPorTipo(tipo);
    const nombres = data.pokemon.map(x => x.pokemon.name);
    const subset = nombres.slice(0, 40); // limitar para no saturar
    const setFavs = new Set(leerFavoritos());

    const tarjetas = await Promise.all(subset.map(async (name) => {
      const det = await obtenerPokemon(name);
      const imagen = det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';
      return tarjetaPokemon({ nombre: det.name, imagen, numero: det.id, esFavorito: setFavs.has(det.name) });
    }));
    contenedorLista.innerHTML = tarjetas.join('');
    contenedorPaginacion.innerHTML = '';
  }catch(e){ manejarError(e.message); }
  finally{ mostrarCargando(false); }
}

async function buscarPorNombre(e){
  e.preventDefault();
  const termino = entradaBusqueda.value.trim().toLowerCase();
  if(!termino) return;
  try{
    mostrarCargando(true);
    const det = await obtenerPokemon(termino);
    const imagen = det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';
    const setFavs = new Set(leerFavoritos());
    contenedorLista.innerHTML = tarjetaPokemon({ nombre: det.name, imagen, numero: det.id, esFavorito: setFavs.has(det.name) });
    contenedorPaginacion.innerHTML = '';
  }catch(e){ manejarError('Pokémon no encontrado'); }
  finally{ mostrarCargando(false); }
}

async function manejarClickLista(e){
  const btnDet = e.target.closest('[data-accion="detalles"]');
  const btnFav = e.target.closest('[data-accion="favorito"]');

  if(btnDet){
    const nombre = btnDet.dataset.nombre;
    mostrarDetalles(nombre);
  }

  if(btnFav){
    const nombre = btnFav.dataset.nombre;
    const resultado = alternarFavorito(nombre);

    // Pintar/despintar el corazón de la tarjeta
    if(resultado) btnFav.classList.add('favorito-activo');
    else btnFav.classList.remove('favorito-activo');

    if(window.Swal){
      Swal.fire({
        toast:true, position:'top-end', timer:1500, showConfirmButton:false,
        icon: resultado ? 'success' : 'info',
        title: resultado ? 'Agregado a favoritos' : 'Eliminado de favoritos'
      });
    }else{
      alert(resultado ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    }
  }
}

async function mostrarDetalles(nombre){
  try{
    mostrarCargando(true);
    const det = await obtenerPokemon(nombre);

    // Título e imagen
    document.getElementById('titulo_modal').textContent = formatearNombre(det.name);
    document.getElementById('img_modal').src =
      det.sprites?.other?.['official-artwork']?.front_default || det.sprites?.front_default || '';

    // Datos básicos
    document.getElementById('peso_modal').textContent = `${det.weight/10} kg`;
    document.getElementById('altura_modal').textContent = `${det.height/10} m`;

    // Habilidades
    const habilidadesES = await Promise.all(
      det.abilities.map(async a => {
        const nombreES = await obtenerHabilidadES(a.ability.name); 
        return capitalizarFrase(String(nombreES).replace(/-/g, ' '));
      })
    );
    document.getElementById('habilidades_modal').textContent = habilidadesES.join(', ');

    // Gráfico
    const etiquetas = det.stats.map(s => traducirStatES(s.stat.name));
    const valores = det.stats.map(s => s.base_stat);
    const ctx = document.getElementById('grafico_estadisticas').getContext('2d');

    if(grafico) grafico.destroy();
    grafico = new Chart(ctx, {
      type: 'bar',
      data: { labels: etiquetas, datasets: [{ label: 'Estadísticas base', data: valores }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Estado inicial del botón de favoritos en el modal
    const btnFavModal = document.getElementById('btn_favorito_modal');
    const esFavAhora = new Set(leerFavoritos()).has(det.name);
    actualizarBotonFavModal(btnFavModal, esFavAhora);

    // Click del botón de favoritos en el modal
    btnFavModal.onclick = () => {
      const r = alternarFavorito(det.name);
      actualizarBotonFavModal(btnFavModal, r);

      // Sincroniza el corazón de la tarjeta (si existe en la lista)
      const btnEnLista = contenedorLista.querySelector(`.btn-favorito[data-nombre="${det.name}"]`);
      if(btnEnLista){
        if(r) btnEnLista.classList.add('favorito-activo');
        else btnEnLista.classList.remove('favorito-activo');
      }

      if(window.Swal){
        Swal.fire({
          toast:true, position:'top-end', timer:1500, showConfirmButton:false,
          icon: r ? 'success' : 'info',
          title: r ? 'Agregado a favoritos' : 'Eliminado de favoritos'
        });
      }else{
        alert(r ? 'Agregado a favoritos' : 'Eliminado de favoritos');
      }
    };

    // Mostrar modal
    if(instanciaModal) instanciaModal.show();
  }catch(e){
    manejarError(e.message);
  }finally{
    mostrarCargando(false);
  }
}



// Utilidad para el botón del modal (rojo si es favorito)
function actualizarBotonFavModal(boton, esFavorito){
  boton.textContent = esFavorito ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
  // estilo visual usando clases de Bootstrap
  boton.classList.toggle('btn-danger', esFavorito);
  boton.classList.toggle('btn-outline-primary', !esFavorito);
}
