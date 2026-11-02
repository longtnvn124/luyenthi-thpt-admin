export interface Environment {
	appVersion : string,
	production : Boolean,
	deploy : EnvironmentDeployment
}

export class EnvironmentDeployment {
	readonly title : string;
	readonly googleClientId : string;
	readonly domain : string;
	readonly url : string;
	readonly api : string;
	readonly fileDir : string;
	readonly media : string;
	readonly driverFile : string;
	readonly aws : string;
	readonly X_APP_ID : string;
	readonly realm : string;
	readonly ws : EnvironmentDeployWebSocket;

	constructor ( configs : EnvironmentDeploymentInfo ) {
		this.title          = configs.title;
		this.googleClientId = configs.googleClientId;
		this.X_APP_ID       = configs.X_APP_ID;
		this.realm          = configs.realm;
		this.ws             = new EnvironmentDeployWebSocket( configs.webSocket );
		this.domain         = `${ configs.protocol }://${ configs.apiServerDomainName }`;
		this.url            = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/`;
		this.api            = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/${ configs.realm }/api/`;
		this.fileDir        = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/folder/${ configs.realm }/`;
		this.media          = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/${ configs.realm }/api/uploads/`;
		this.driverFile     = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/${ configs.realm }/api/driver/`;
		this.aws            = `${ configs.protocol }://${ configs.apiServerDomainName }:${ configs.port }/${ configs.realm }/api/aws/`;
	}
}

export interface EnvironmentDeploymentInfo {
	title : string;
	googleClientId : string;
	apiServerDomainName : string;
	port : number;
	X_APP_ID : string;
	realm : string;
	rows : number;
	protocol : EnvironmentDeployProtocol,
	webSocket : WebSocketConfig
}

type EnvironmentDeployProtocol = 'http' | 'https';

type WebSocketScheme = 'ws' | 'wss';

interface WebSocketConfig {
	path : string;
	port : number;
	scheme : WebSocketScheme;
	domain : string;
}

class EnvironmentDeployWebSocket {

	private readonly config : WebSocketConfig;

	private get c () : WebSocketConfig {
		return this.config;
	}

	constructor ( config : WebSocketConfig ) {
		this.config = config;
	}

	public get url () : string {
		return `${ this.c.scheme }://${ this.c.domain }:${ this.c.port }/`;
	}

	public get path () : string {
		return this.c.path;
	}
}

type DeploymentDomain = 'localhost' | 'thi-thpt.tnu.vn';

export const DEPLOYMENT_RESOURCE : Record<DeploymentDomain , EnvironmentDeploymentInfo> = {
	'localhost'       : {
		title               : 'Hệ thống quản lý luyện thi THPT - DHTN' ,
		googleClientId      : '196027039836-kjhoo8f8p3i2eldcodouvs94p1gbi4jo.apps.googleusercontent.com' ,
		apiServerDomainName : 'api-dev.ictu.vn' ,
		port                : 10091 ,
		X_APP_ID            : '0645451e-3396-41eb-8d02-ae39cb030cdd' ,
		realm               : 'luyenthi-thpt' ,
		rows                : 20 ,
		protocol            : 'https' ,
		webSocket           : {
			path   : '/sso/socket' ,
			port   : 10092 ,
			scheme : 'wss' ,
			domain : 'api-dev.ictu.vn'
		}
	} ,
	'thi-thpt.tnu.vn' : {
		title               : 'Hệ thống quản lý luyện thi THPT - DHTN' ,
		googleClientId      : '196027039836-kjhoo8f8p3i2eldcodouvs94p1gbi4jo.apps.googleusercontent.com' ,
		apiServerDomainName : 'apiv3.ictu.edu.vn' ,
		port                : 10081 ,
		X_APP_ID            : '93B37A33-969A-41EF-B39B-BC2BF9A67EA9' ,
		realm               : 'luyenthi-thpt' ,
		rows                : 20 ,
		protocol            : 'https' ,
		webSocket           : {
			path   : '/sso/socket' ,
			port   : 10082 ,
			scheme : 'wss' ,
			domain : 'apiv3.ictu.edu.vn'
		}
	}
};