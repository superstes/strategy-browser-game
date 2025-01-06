#!/usr/bin/env python3

from sys import argv
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler, test


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, directory=serve_path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        SimpleHTTPRequestHandler.end_headers(self)


if __name__ == '__main__':
    if len(argv) == 1:
        raise ValueError('You need to provide the path to serve')

    serve_path = argv[1]
    if not Path(serve_path).is_dir():
        raise ValueError(f'Provided directory does not exist: {serve_path}')

    print(f'Serving path: {serve_path}')
    test(CORSRequestHandler, HTTPServer, port=8000, bind='127.0.0.1')
