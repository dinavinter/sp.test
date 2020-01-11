import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index';
import ssoRouter from './routes/sso';
import sloRouter from './routes/slo';
import commandsRouter from './routes/commands';
import metadataRouter from './routes/metadata';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.set('views', './views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw({extended: true}));
app.use(bodyParser.text({extended: true}));
app.use(bodyParser.json({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use('/', ssoRouter);
app.use('/', sloRouter);
app.use('/', commandsRouter);
app.use('/', metadataRouter);
app.use(cors());


export default app;
