import { DataSource } from 'typeorm';
import AppConfig from '@/infrastructure/config/app.config';
import { buildTypeOrmOptions } from './typeorm.options';

const appConfig = AppConfig();

const dataSource = new DataSource(buildTypeOrmOptions(appConfig));

export default dataSource;
