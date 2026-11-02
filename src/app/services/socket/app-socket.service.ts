import { ENVIRONMENT } from '@env';
import { BehaviorSubject , Observable , Subject } from 'rxjs';
import { io , Socket } from "socket.io-client";

export type AppSocketEventName = 'close' | 'connect' | 'error' | 'pause' | 'continue' | 'violation' | 'reject' | 'submitted' | 'photo_before_exam' | 'photo_during_exam';

export type AppSocketEventControlName = 'pause' | 'continue' | 'violation' | 'reject' | 'submitted' | 'photo_before_exam' | 'photo_during_exam';

export interface AppSocketEvent {
	name : AppSocketEventName;
	data : any
}

export class AppSocket {
	
	private set socket ( socket : Socket ) {
		this._socket = socket;
	}
	
	private _socket : Socket;
	private get socket () : Socket {
		return this._socket;
	}
	
	private _observer : Subject<AppSocketEvent> = new Subject<AppSocketEvent>();
	observerStatus : BehaviorSubject<boolean>   = new BehaviorSubject<boolean>( false );
	
	constructor ( accessToken : string ) {
		this.connect( accessToken );
	}
	
	connect ( accessToken : string ) : void {
		this.disconnect();
		if ( accessToken ) {
			this.socket = io( ENVIRONMENT.deploy.ws.url , {
				reconnection : true ,
				// reconnectionAttempts: 5,
				// reconnectionDelay: 1000,
				autoConnect : true ,
				path        : ENVIRONMENT.deploy.ws.path ,
				auth        : {
					token : accessToken ,
					realm : ENVIRONMENT.deploy.realm ,
				} ,
				transports  : [ 'websocket' , 'polling' ] ,
			} );
			this.socket.on( 'connect' , () : void => {
				const engine = this.socket.io.engine;
				this._observer.next( { name : 'connect' , data : null } );
				this.observerStatus.next( true );
				
				engine.on( 'close' , () : void => {
					this._observer.next( { name : 'close' , data : null } );
					this.observerStatus.next( false );
				} );
				engine.on( 'error' , () : void => {
					this._observer.next( { name : 'error' , data : null } );
				} );
				
			} );
			
			this.socket.on( 'pause' , ( data : any ) : void => {
				console.log( 'pause' , data );
				this._observer.next( { name : 'pause' , data } )
			} )
			
			this.socket.on( 'continue' , ( data : any ) : void => {
				console.log( 'continue' , data );
				this._observer.next( { name : 'continue' , data } )
			} )
			
			this.socket.on( 'submitted' , ( data : any ) : void => {
				this._observer.next( { name : 'submitted' , data } )
			} )
			
			this.socket.on( 'reject' , ( data : any ) : void => {
				this._observer.next( { name : 'reject' , data } )
			} )
			
			this.socket.on( 'photo_during_exam' , ( data : any ) : void => {
				this._observer.next( { name : 'photo_during_exam' , data } )
			} )
			
			this.socket.on( 'photo_before_exam' , ( data : any ) : void => {
				this._observer.next( { name : 'photo_before_exam' , data } )
			} )
			
		}
	}
	
	disconnect () : void {
		if ( this._socket ) {
			this._socket.disconnect();
			this._socket.close();
		}
		this.observerStatus.next( false );
	}
	
	get observer () : Observable<AppSocketEvent> {
		return this._observer.asObservable();
	}
}
