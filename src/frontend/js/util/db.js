
const STORE_DB_CREATED = 'db-created';
const DB_NAME = "GameDB";

// todo: check out: https://github.com/localForage/localForage/

export const db = (function() {
return {
    CreateDB: function() {
        if (localStorage.getItem(STORE_DB_CREATED) == '1') {
            return;
        }

        let dbReq = window.indexedDB.open(DB_NAME);
        dbReq.onerror = (event) => {
            console.error("IndexedDB is needed");
        };
        dbReq.onsuccess = (event) => {
            let dbi = event.target.result;
            let chunkStore = dbi.createObjectStore("chunks", { keyPath: "cid" });
            chunkStore.createIndex("pos_x", "pos_x", { unique: false });
            chunkStore.createIndex("pos_y", "pos_y", { unique: false });

            chunkStore.transaction.oncomplete = () => {
                localStorage.setItem(STORE_DB_CREATED, '1');
            };
        };
    },

    SaveMapChunk: function(data, pos_x, pos_y, buildTime) {
        let cid = `${pos_x}_${pos_y}`
        let dbReq = window.indexedDB.open(DB_NAME);
        dbReq.onerror = (event) => {
            console.error(`Failed to save map-chunk ${cid} - IndexedDB is needed`);
        };
        dbReq.onsuccess = (event) => {
            let dbi = event.target.result;
            let chunkStore = dbi.transaction("chunks", "readwrite").objectStore("chunks");
            chunkStore.add({
                cid: cid,
                buildTime: buildTime,
                pos_x: pos_x,
                pos_y: pos_y,
                data: JSON.stringify(data),
            });
        }
    },

    LoadMapChunk: function(pos_x, pos_y, callback) {
        let cid = `${pos_x}_${pos_y}`
        let dbReq = window.indexedDB.open(DB_NAME);
        dbReq.onerror = (event) => {
            console.error(`Failed to load map-chunk ${cid} - IndexedDB is needed`);
        };
        dbReq.onsuccess = (event) => {
            let dbi = event.target.result;
            let chunkStore = dbi.transaction("chunks", "readwrite").objectStore("chunks");
            chunkStore.get(cid).onsuccess = (event) => {
                callback({data: JSON.parse(event.target.result.data)});
            };
        }
    },
};
})();
