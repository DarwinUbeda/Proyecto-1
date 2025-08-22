const CLAVE = 'pokedex_favoritos';

export function leerFavoritos(){
  try{
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
  }catch{
    return [];
  }
}

export function guardarFavoritos(lista){
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function alternarFavorito(nombre){
  const favs = new Set(leerFavoritos());
  if(favs.has(nombre)) favs.delete(nombre);
  else favs.add(nombre);
  guardarFavoritos([...favs]);
  return favs.has(nombre); 
}
