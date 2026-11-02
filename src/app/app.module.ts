import { InjectionToken , NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from '@sharedModule';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ACCESS_TOKEN_KEY , REFRESH_TOKEN_KEY } from '@env';
import { HttpClientModule , provideHttpClient , withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './interceptor/interceptor';
import { MatDialog , MatDialogModule } from '@angular/material/dialog';
import { getSaver , SAVER } from './providers/saver.provider';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { environment } from "../environments/environment.prod";

export function tokenGetter () : string | null {
	return localStorage.getItem( ACCESS_TOKEN_KEY );
}

export function tokenSetter ( access_token : string ) : string {
	localStorage.setItem( ACCESS_TOKEN_KEY , access_token );
	return access_token;
}

export function deleteToken () : void {
	if ( localStorage.getItem( ACCESS_TOKEN_KEY ) ) {
		localStorage.removeItem( ACCESS_TOKEN_KEY );
	}
}

export function refreshTokenGetter () : string | null {
	return localStorage.getItem( REFRESH_TOKEN_KEY );
}

export function refreshTokenSetter ( refresh_token : string ) {
	return localStorage.setItem( REFRESH_TOKEN_KEY , refresh_token );
}

const d : Date = new Date();

const diff : number = ( d.getTimezoneOffset() / 60 ) * -1;

export const currentUserTimeZone : string = `(UTC${ ( diff >= 0 ? ( '+' + diff.toString( 10 ).padStart( 2 , '0' ) ) : diff.toString( 10 ).padStart( 2 , '0' ) ) })`;

export const APP_VERSION_WITH_TIMEZONE : InjectionToken<string> = new InjectionToken<string>( 'APP_VERSION_WITH_TIMEZONE' );

export const appVersionWithTimeZoneUseValue : string = `V${ environment.appVersion } ${ currentUserTimeZone }`;


@NgModule( {
	declarations : [
		AppComponent
	] ,
	imports      : [
		BrowserModule ,
		AppRoutingModule ,
		BrowserAnimationsModule ,
		SharedModule ,
		MatDialogModule ,
		ToastModule ,
		ReactiveFormsModule ,
		TableModule ,
		HttpClientModule
	] ,
	providers    : [
		MatDialog ,
		MessageService ,
		provideHttpClient( withInterceptors( [ httpInterceptor ] ) ) ,
		{ provide : SAVER , useFactory : getSaver } ,
		{ provide : APP_VERSION_WITH_TIMEZONE , useValue : appVersionWithTimeZoneUseValue }
	] ,
	bootstrap    : [ AppComponent ]
} )
export class AppModule {
}
