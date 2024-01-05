import {createServer} from 'net';
import {readFile, readdir} from 'fs';
import {extname, join} from 'path';
import {fileURLToPath} from 'url';

// absolute path path including filename of _this_ file (`server.mjs`)
const __filename = fileURLToPath(import.meta.url);

// absolute path of the directory that this files is in
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// absolute path to the public directory (you can use this along with 
// join from the path module and a file name to craft an absolute path
// to a file in src/public
const __root = join(__dirname, 'public');


const MIMETYPES = new Map();
MIMETYPES.set('.jpg', 'image/jpg');
MIMETYPES.set('.html', 'text/html');
MIMETYPES.set('.txt', 'text/plain');
MIMETYPES.set('.css', 'text/css');
MIMETYPES.set('.md', 'text/plain');

/*
// uncomment if you prefer to use objects instead of maps
const MIMETYPES = {
  '.jpg': 'image/jpg',
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.css': 'text/css',
  '.md': 'text/plain',
}
*/

const DESCRIPTIONS = new Map();
DESCRIPTIONS.set(200, 'OK');
DESCRIPTIONS.set(404, 'Not Found');
DESCRIPTIONS.set(500 , 'Server Error');

/*
// uncomment if you prefer to use objects instead of maps
const DESCRIPTIONS = {
  200: 'OK',
  404: 'Not Found',
  500: 'Server Error',
  get: function(k) { return this[k] }
}
*/

const [PORT, HOSTNAME] = [3000, '127.0.0.1'];


class Request {
  constructor(s){
    const requestParts = s.split(' ');
    const path = requestParts[1];
    this.path = path;
  }
}

function checkFileExists(filePath, successCallback, errorCallback) {
  readFile(filePath, (readError) => {
    if (readError) {
      errorCallback();
    } else {
      successCallback();
    }
  });
}

function sendResponse(sock, statusCode, contentType, body) {
  sock.write(`HTTP/1.1 ${statusCode} ${DESCRIPTIONS.get(statusCode)}\r\n`);
  sock.write(`Content-Type: ${contentType}\r\n`);
  sock.write(`Content-Length: ${body.length}\r\n`);
  sock.write('\r\n');
  sock.write(body);
  sock.end();
}

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIMETYPES.get(ext);
}
function listFiles(directory, callback) {
  readdir(directory, (readDirError, files) => {
    if (readDirError) {
      callback([]);
    } else {
      callback(files);
    }
  });
}

function generateHtmlPage(callback) {
  listFiles(__root, (files) => {
    const links = files.map((file) => `<a href="/${file}">${file}</a>`).join('<br>');

    const htmlPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Files in src/public</title>
      </head>
      <body>
        ${links}
      </body>
      </html>
    `;

    callback(htmlPage);
  });
}

function handleConnect(sock){
  sock.setEncoding('utf-8');
  let requestData = '';

  sock.on('data', (chunk) => {
    requestData += chunk;
    if (requestData.includes('\r\n\r\n')) {
      const request = new Request(requestData);

      if (request.path === '/') {
        generateHtmlPage((htmlPage) => {
          sendResponse(sock, 200, 'text/html', htmlPage);
        });
      } else {
        const filePath = join(__root, request.path);

        checkFileExists(filePath, () => {
          const contentType = getContentType(filePath);

          readFile(filePath, (readError, fileData) => {
            if (readError) {
              sendResponse(sock, 500, 'text/plain', 'Internal Server Error');
            } else {
              sendResponse(sock, 200, contentType, fileData);
            }
          });
        }, () => {
          sendResponse(sock, 404, 'text/plain', 'Not Found');
        });
      }
    }
  });
    sock.on('close', () => {
      console.log('Client disconnected:', sock.remoteAddress);
    });
}

const server = createServer(handleConnect);

server.listen(PORT, HOSTNAME);

