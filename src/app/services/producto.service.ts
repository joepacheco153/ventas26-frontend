import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Producto } from '../models/producto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private httpHeaders = new HttpHeaders({ 'Content-Type':'application/json'});
  private prodUrl:string = 'http://localhost:8080/productos';//endpoint
  constructor(private http:HttpClient, private router:Router,
              private authService: AuthService) { }
  private addAuthorizationHeader(){
    let token = this.authService.token;
    if(token!=null){
      return this.httpHeaders.append('Authorization','Bearer '+ token);
    }
    return this.httpHeaders;
  }
  private isNoAutorization(e): boolean{
    if(e.status==401 || e.status==403){
      this.router.navigate(['/login'])
      return true;
    }
    return false;
  }
  getProductos():Observable<any>{
    return this.http.get(this.prodUrl+'/all',{headers:this.addAuthorizationHeader()}).pipe(
      catchError(e =>{
        this.isNoAutorization(e);
        return throwError(e);
      })
    );
  }
  addProducto(producto: Producto): Observable<number>{
    return this.http.post<number>(this.prodUrl+"/add", producto, {headers:this.addAuthorizationHeader()}).pipe(
      map((response:any) =>response),
      catchError(e =>{
        if(this.isNoAutorization(e)){
        return throwError(e)
        }
        if(e.status == 400){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
      );
  }
 
  
}
