import packageInfo from '../../package.json';
import { DEPLOYMENT_RESOURCE , Environment , EnvironmentDeployment } from './environment.model';

export const environment : Environment = {
	appVersion : packageInfo.version ,
	production : true ,
	deploy     : new EnvironmentDeployment( DEPLOYMENT_RESOURCE[ 'thi-thpt.tnu.vn' ] )
};
