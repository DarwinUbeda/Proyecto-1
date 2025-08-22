export class Paginador{
  constructor({ limite = 20, totalEstimado = 1302 }){
    this.limite = limite;
    this.total = totalEstimado; // aproximado de PokeAPI
    this.pagina = 1;
  }
  setPagina(n){ this.pagina = Math.max(1, n); }
  get offset(){ return (this.pagina - 1) * this.limite; }
  get totalPaginas(){ return Math.ceil(this.total / this.limite); }
}
