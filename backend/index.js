import http from 'node:http';

import { pipeHTTP } from './lib/server.js';
import { tee } from './lib/utils.js';

const srv = http.createServer({captureRejections: true});
srv.listen(9001, () => console.log("Listening on port 9001"));

const logReq = (obj) => console.log(obj.req.headers);
const rejectMe = ({req, res, ctx}) => Promise.reject({req, res, ctx: {...ctx, errorCode: 500, errMsg: "Internal my bad. Oops!"}});
const sendOK = ({req, res, ctx}) => res.end("Thank you for visiting today!");
const catchHandler = ({req,res,ctx}) => {
  res.statusCode = ctx.errorCode;
  res.end(ctx.errMsg);
};

const promHTTP = (req, res) => Promise.resolve({req, res, ctx: {}})
                               .then(tee(logReq))
                               .then(rejectMe)
                               .then(sendOK)
                               .catch(catchHandler)

srv.on('request', promHTTP);