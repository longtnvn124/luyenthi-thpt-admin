import { Injectable } from '@angular/core';
import { IctuDocument , IctuMediaSourceType } from '@model/file';

interface LocalStorageMediaStorageObject {
	name : IctuMediaSourceType;
	data : Map<string , string>;
}

type LocalStorageMediaSaver = Record<IctuMediaSourceType , ( file : IctuDocument , url : string ) => void>

type LocalStorageMediaStorages = Record<IctuMediaSourceType , LocalStorageMediaStorageObject>

@Injectable( {
	providedIn : 'root'
} )
export class LocalStorageMediaService {

	private saver : LocalStorageMediaSaver = {
		googleDrive : ( file : IctuDocument , url : string ) => {
			const fileId : string = typeof file.path === 'string' ? file.path : file.path.toString( 10 );
			if ( !this.storages.googleDrive.data.has( fileId ) ) {
				this.storages.googleDrive.data.set( fileId , url );
			}
		} ,
		serverAws   : ( file : IctuDocument , url : string ) => {
			const fileId : string = typeof file.path === 'string' ? file.path : file.path.toString( 10 );
			if ( !this.storages.serverAws.data.has( fileId ) ) {
				this.storages.serverAws.data.set( fileId , url );
			}
		} ,
		serverFile  : ( file : IctuDocument , url : string ) => {
			const fileId : string = typeof file.path === 'string' ? file.path : file.path.toString( 10 );
			if ( !this.storages.serverFile.data.has( fileId ) ) {
				this.storages.serverFile.data.set( fileId , url );
			}
		} ,
		encrypted   : () => {} ,
		local       : () => {} ,
		vimeo       : () => {} ,
		youtube     : () => {}
	};

	private storages : LocalStorageMediaStorages = {
		encrypted   : {
			name : 'encrypted' ,
			data : new Map<string , string>( [] )
		} ,
		googleDrive : {
			name : 'googleDrive' ,
			data : new Map<string , string>( [] )
		} ,
		local       : {
			name : 'local' ,
			data : new Map<string , string>( [] )
		} ,
		serverAws   : {
			name : 'serverAws' ,
			data : new Map<string , string>( [] )
		} ,
		serverFile  : {
			name : 'serverFile' ,
			data : new Map<string , string>( [] )
		} ,
		vimeo       : {
			name : 'vimeo' ,
			data : new Map<string , string>( [] )
		} ,
		youtube     : {
			name : 'youtube' ,
			data : new Map<string , string>( [] )
		}
	};

	get( file : IctuDocument ) : string {
		const fileId : string = typeof file.path === 'string' ? file.path : file.path.toString( 10 );
		return this.storages[ file.source ].data.has( fileId ) ? this.storages[ file.source ].data.get( fileId ) : '';
	}

	set( file : IctuDocument , url : string ) : void {
		this.saver[ file.source ]( file , url );
	}
}
