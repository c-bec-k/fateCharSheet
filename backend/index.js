import {createServer} from 'node:http';
import {env} from 'node:process';
import {extname, parse} from 'node:path';
import {readFile} from 'node:fs/promises';

const contentTypes = {
  '.css': 'text/css',
  '.js' : 'text/javascript',
  '.html': 'text/html'
}

const server = createServer().listen( env.PORT || 9001, () => console.log("Server running on port", env.PORT || 9001));

const parseReqBody = async ({req, res, ctx}) =>  {
  if (!req['headers']['content-type']) return {req, res, ctx};
  let data = '';
  for await (const chunk of req) {
    data += chunk;
  }
  ctx.set('reqBody', data);
  return {req, res, ctx};
};


const serveStatic = async ({req, res, ctx}) => {
  const reqUrl = req.url;
  if (reqUrl === '/favicon.ico') return {req,res,ctx};
  console.log(reqUrl);
  let dir = '../frontend';
  if (reqUrl === '/') {
    dir += '/index.html';
    ctx.set('Content-Type', 'text/html');
    ctx.set('statusCode', 200);
    const reqFile = await readFile(dir);
    ctx.set('resBody', reqFile);
  } else {
    dir += reqUrl;
    try {
      const reqFile = await readFile(dir);
      ctx.set('Content-Type', contentTypes[extname(dir)]);
      ctx.set('resBody', reqFile);
      ctx.set('statusCode', 200); 
    } catch {
      console.error(`Requested ${dir} does not exist.`);
    }
  }

  return {req,res,ctx};
}

const sendResponse = ({res,ctx}) => {
  res.setHeader('Content-Type', ctx.get('Content-Type') || 'application/octet-stream');
  res.statusCode = ctx.get('statusCode') || 500;
  res.end(ctx.get('resBody'));
};


const HTTPhandler = (req, res) => Promise.resolve({req, res, ctx: new Map()})
  .then(parseReqBody)
  .then(serveStatic)
  .then(sendResponse)


server.on('request', HTTPhandler);
