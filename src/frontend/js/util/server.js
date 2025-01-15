import {u} from '../util/utils.js';

const hdrServer = "gameserver";


function loadServerHeaders() {
    let srv = u.GetCookie(hdrServer);
    if (srv !== null) {
      return;
    }

    let req = new XMLHttpRequest();
    req.open("HEAD", window.location, true);
    req.send();
    req.onreadystatechange = () => {
      if (req.readyState === req.HEADERS_RECEIVED) {
        let hdrArr = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
    
        let hdrMap = {};
        hdrArr.forEach((line) => {
          let parts = line.split(": ");
          let header = parts.shift();
          let value = parts.join(": ");
          hdrMap[header] = value;
        });
        u.SetCookie(hdrServer, hdrMap[hdrServer], 1);
      }
    }
}

export function GetServerURL() {
  loadServerHeaders();
  return u.GetCookie(hdrServer);
}

export const srv = (function() {
  return {
    LoadJSON: function(location, callback) {
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let resp = JSON.parse(this.responseText);
                callback(resp);
            }
        };
        req.open("GET", GetServerURL() + '/' + location, true);
        req.send();
    },
    LoadText: function(location, callback) {
      let req = new XMLHttpRequest();
      req.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              callback(this.responseText);
          }
      };
      req.open("GET", GetServerURL() + '/' + location, true);
      req.send();
    },
  };
})();
