export function mostrarCargando(mostrar = true){
  const el = document.getElementById('cargando');
  if(!el) return;
  el.style.display = mostrar ? 'inline-block' : 'none';
}

export function formatearNombre(nombre){
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function manejarError(mensaje = 'Ocurrió un error inesperado'){
  alert(mensaje);
}


export const mapaTiposES = {
  normal:'Normal', fighting:'Lucha', flying:'Volador', poison:'Veneno',
  ground:'Tierra', rock:'Roca', bug:'Bicho', ghost:'Fantasma', steel:'Acero',
  fire:'Fuego', water:'Agua', grass:'Planta', electric:'Eléctrico',
  psychic:'Psíquico', ice:'Hielo', dragon:'Dragón', dark:'Siniestro',
  fairy:'Hada', stellar:'Estelar', unknown:'Desconocido', shadow:'Sombra'
};

export function capitalizarFrase(s){
  if(!s) return '';
  return s.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export function traducirTipoES(nombreTipo){
  if(!nombreTipo) return '';
  const key = nombreTipo.toLowerCase();
  return mapaTiposES[key] || capitalizarFrase(nombreTipo.replace(/-/g,' '));
}

const mapaStatsES = {
  'hp':'PS',
  'attack':'Ataque',
  'defense':'Defensa',
  'special-attack':'At. Esp.',
  'special-defense':'Def. Esp.',
  'speed':'Velocidad'
};

export function traducirStatES(nombreStat){
  if(!nombreStat) return '';
  const key = nombreStat.toLowerCase();
  return mapaStatsES[key] || capitalizarFrase(nombreStat.replace(/-/g,' '));
}
