const URL_BASE = 'https://pokeapi.co/api/v2';

export async function obtenerListaPokemon(offset = 0, limit = 20){
  const url = `${URL_BASE}/pokemon?offset=${offset}&limit=${limit}`;
  const resp = await fetch(url);
  if(!resp.ok) throw new Error('No se pudo obtener la lista');
  return await resp.json();
}

export async function obtenerPokemon(nombre){
  const resp = await fetch(`${URL_BASE}/pokemon/${nombre.toLowerCase()}`);
  if(!resp.ok) throw new Error('Pokémon no encontrado');
  return await resp.json();
}

export async function obtenerTipos(){
  const resp = await fetch(`${URL_BASE}/type`);
  if(!resp.ok) throw new Error('No se pudieron obtener los tipos');
  return (await resp.json()).results;
}

export async function obtenerPorTipo(tipoNombre){
  const resp = await fetch(`${URL_BASE}/type/${tipoNombre}`);
  if(!resp.ok) throw new Error('No se pudo obtener por tipo');
  return await resp.json();
}

export async function obtenerHabilidadES(nombre){
  // Devuelve el nombre de la habilidad en español (si existe)
  const resp = await fetch(`${URL_BASE}/ability/${nombre.toLowerCase()}`);
  if(!resp.ok) return nombre;
  const data = await resp.json();
  const es = data.names?.find(n => n.language?.name === 'es');
  return es?.name || nombre;
}

