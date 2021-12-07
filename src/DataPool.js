let DataPool = {};

DataPool.create = function name(targetHost) {


    const host = targetHost || "";
    const pool = {};
    let data = new Map();

    pool.loadData = async function (url) {
        const response = await fetch(host + url, {
            method: "GET",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
            },
        });

        const jsonData = await response.json();
        data.set(host + url, jsonData);
        return jsonData;
    }

    pool.getObjectFromListWithProp = function (url, prop, value) {
        if (data.has(host + url)) {
            return data.get(host + url).find(item => item[prop] == value);
        } else {
            return null;
        };
    };

    return pool;
}

export { DataPool };






