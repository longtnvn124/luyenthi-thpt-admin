import { AfterViewInit , Component , ElementRef , EventEmitter , Input , NgZone , OnChanges , OnDestroy , Output , Renderer2 , SimpleChange , ViewChild } from '@angular/core';
import * as Plyr from 'plyr';
import { BehaviorSubject , Observable , Subscription } from 'rxjs';
import { filter , first , switchMap } from 'rxjs/operators';
import { DefaultPlyrDriver } from '../plyr-driver/default-plyr-driver';
import { PlyrDriver } from '../plyr-driver/plyr-driver';

@Component( {
	selector    : 'plyr, [plyr]' , // tslint:disable-line
	templateUrl : './plyr.component.html' ,
	styleUrls   : [ './plyr.component.css' ] ,
	exportAs    : 'plyr'
} )
export class PlyrComponent implements AfterViewInit , OnChanges , OnDestroy {

	private playerChange : BehaviorSubject<Plyr> = new BehaviorSubject<Plyr>( null );

	get player() : Plyr {
		return this.playerChange.getValue();
	}

	private events = new Map();

	@Input() plyrDriver : PlyrDriver;

	@Input() plyrType : Plyr.MediaType = 'video';

	@Input() plyrTitle : string;

	@Input() plyrPoster : string;

	@Input() plyrSources : Plyr.Source[];

	@Input() plyrTracks : Plyr.Track[];

	@Input() plyrOptions : Plyr.Options;

	@Input() plyrCrossOrigin : boolean;

	@Input() plyrPlaysInline : boolean;

	@ViewChild( 'v' ) private vr : ElementRef;

	// ngx-plyr events
	@Output() plyrInit : EventEmitter<Plyr> = this.playerChange.pipe( filter( player => !!player ) ) as EventEmitter<Plyr>;

	// standard media events
	@Output() plyrProgress : EventEmitter<Plyr.PlyrEvent>         = this.createLazyEvent( 'progress' );
	@Output() plyrPlaying : EventEmitter<Plyr.PlyrEvent>          = this.createLazyEvent( 'playing' );
	@Output() plyrPlay : EventEmitter<Plyr.PlyrEvent>             = this.createLazyEvent( 'play' );
	@Output() plyrPause : EventEmitter<Plyr.PlyrEvent>            = this.createLazyEvent( 'pause' );
	@Output() plyrTimeUpdate : EventEmitter<Plyr.PlyrEvent>       = this.createLazyEvent( 'timeupdate' );
	@Output() plyrVolumeChange : EventEmitter<Plyr.PlyrEvent>     = this.createLazyEvent( 'volumechange' );
	@Output() plyrSeeking : EventEmitter<Plyr.PlyrEvent>          = this.createLazyEvent( 'seeking' );
	@Output() plyrSeeked : EventEmitter<Plyr.PlyrEvent>           = this.createLazyEvent( 'seeked' );
	@Output() plyrRateChange : EventEmitter<Plyr.PlyrEvent>       = this.createLazyEvent( 'ratechange' );
	@Output() plyrEnded : EventEmitter<Plyr.PlyrEvent>            = this.createLazyEvent( 'ended' );
	@Output() plyrEnterFullScreen : EventEmitter<Plyr.PlyrEvent>  = this.createLazyEvent( 'enterfullscreen' );
	@Output() plyrExitFullScreen : EventEmitter<Plyr.PlyrEvent>   = this.createLazyEvent( 'exitfullscreen' );
	@Output() plyrCaptionsEnabled : EventEmitter<Plyr.PlyrEvent>  = this.createLazyEvent( 'captionsenabled' );
	@Output() plyrCaptionsDisabled : EventEmitter<Plyr.PlyrEvent> = this.createLazyEvent( 'captionsdisabled' );
	@Output() plyrLanguageChange : EventEmitter<Plyr.PlyrEvent>   = this.createLazyEvent( 'languagechange' );
	@Output() plyrControlsHidden : EventEmitter<Plyr.PlyrEvent>   = this.createLazyEvent( 'controlshidden' );
	@Output() plyrControlsShown : EventEmitter<Plyr.PlyrEvent>    = this.createLazyEvent( 'controlsshown' );
	@Output() plyrReady : EventEmitter<Plyr.PlyrEvent>            = this.createLazyEvent( 'ready' );

	// HTML5 events
	@Output() plyrLoadStart : EventEmitter<Plyr.PlyrEvent>      = this.createLazyEvent( 'loadstart' );
	@Output() plyrLoadedData : EventEmitter<Plyr.PlyrEvent>     = this.createLazyEvent( 'loadeddata' );
	@Output() plyrLoadedMetadata : EventEmitter<Plyr.PlyrEvent> = this.createLazyEvent( 'loadedmetadata' );
	@Output() plyrQualityChange : EventEmitter<Plyr.PlyrEvent>  = this.createLazyEvent( 'qualitychange' );
	@Output() plyrCanPlay : EventEmitter<Plyr.PlyrEvent>        = this.createLazyEvent( 'canplay' );
	@Output() plyrCanPlayThrough : EventEmitter<Plyr.PlyrEvent> = this.createLazyEvent( 'canplaythrough' );
	@Output() plyrStalled : EventEmitter<Plyr.PlyrEvent>        = this.createLazyEvent( 'stalled' );
	@Output() plyrWaiting : EventEmitter<Plyr.PlyrEvent>        = this.createLazyEvent( 'waiting' );
	@Output() plyrEmptied : EventEmitter<Plyr.PlyrEvent>        = this.createLazyEvent( 'emptied' );
	@Output() plyrCueChange : EventEmitter<Plyr.PlyrEvent>      = this.createLazyEvent( 'cuechange' );
	@Output() plyrError : EventEmitter<Plyr.PlyrEvent>          = this.createLazyEvent( 'error' );

	// YouTube events
	@Output() plyrStateChange : EventEmitter<Plyr.PlyrEvent> = this.createLazyEvent( 'statechange' );

	private subscriptions : Subscription[] = [];

	private driver : PlyrDriver;

	private videoElement : HTMLVideoElement;

	constructor(
		private elementRef : ElementRef<HTMLDivElement> ,
		private ngZone : NgZone ,
		private renderer : Renderer2
	) {
	}

	ngOnChanges( changes : { [p in keyof PlyrComponent]? : SimpleChange; } ) {
		this.subscriptions.push( this.plyrInit.pipe( first() ).subscribe( ( player : Plyr ) => {
			const reInitTriggers = [ changes.plyrOptions , changes.plyrPlaysInline , changes.plyrCrossOrigin ].filter( t => !!t );
			if ( reInitTriggers.length ) {
				if ( reInitTriggers.some( t => !t.firstChange ) ) {
					this.initPlyr( true );
				}
			} else {
				this.updatePlyrSource( player );
			}
		} ) );
	}

	ngOnDestroy() {
		this.destroyPlayer();
		this.subscriptions.forEach( s => s.unsubscribe() );
	}

	ngAfterViewInit() {
		this.initPlyr();
	}

	private initPlyr( force = false ) {
		if ( force || !this.player ) {
			this.ngZone.runOutsideAngular( () => {
				this.destroyPlayer();

				this.driver = this.plyrDriver || new DefaultPlyrDriver();

				this.ensureVideoElement();

				const newPlayer = this.driver.create( {
					videoElement : this.videoElement ,
					options      : this.plyrOptions
				} );

				this.updatePlyrSource( newPlayer );

				this.playerChange.next( newPlayer );
			} );
		}
	}

	private updatePlyrSource( plyr : Plyr ) {
		this.driver.updateSource( {
			videoElement : this.videoElement ,
			plyr ,
			source       : {
				type    : this.plyrType ,
				title   : this.plyrTitle ,
				sources : this.plyrSources ,
				poster  : this.plyrPoster ,
				tracks  : this.plyrTracks
			}
		} );
	}

	// see https://stackoverflow.com/a/53704102/1990451
	private createLazyEvent<T extends Plyr.PlyrEvent>( name : Plyr.StandardEvent | Plyr.Html5Event | Plyr.YoutubeEvent ) : EventEmitter<T> {
		return this.plyrInit.pipe(
			switchMap( () => new Observable( observer => this.on( name , ( data : T ) => this.ngZone.run( () => observer.next( data ) ) ) ) )
		) as EventEmitter<T>;
	}

	private destroyPlayer() {
		if ( this.player ) {
			Array.from( this.events.keys() ).forEach( name => this.off( name ) );

			this.driver.destroy( {
				plyr : this.player
			} );

			this.videoElement = null;
		}
	}

	private get hostElement() {
		return this.elementRef.nativeElement;
	}

	// this method is required because the plyr inserts clone of the original element on destroy
	// so we catch the clone element right here and reuse it
	private ensureVideoElement() {
		const videoElement = this.hostElement.querySelector( 'video' );

		if ( videoElement ) {
			this.videoElement = videoElement;
		} else {
			this.videoElement          = this.renderer.createElement( 'video' );
			this.videoElement.controls = true;

			if ( this.plyrCrossOrigin ) {
				this.videoElement.setAttribute( 'crossorigin' , '' );
			}

			if ( this.plyrPlaysInline ) {
				this.videoElement.setAttribute( 'playsinline' , '' );
			}

			this.renderer.appendChild( this.hostElement , this.videoElement );
		}
	}

	private on( name : string , handler : any ) {
		this.events.set( name , handler );
		this.player.on( name as any , handler );
	}

	private off( name : string ) {
		this.player.off( name as any , this.events.get( name ) );
		this.events.delete( name );
	}

}
