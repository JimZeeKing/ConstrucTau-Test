let DataPool = {};

DataPool.create = function name(JSONUrl) {

    let pool = {};

    pool.loadData = async function () {
        const response = await fetch(JSONUrl);
        const text = await response.text();
        pool.data = JSON.parse(text);
        return pool.data;
    }

    pool.getObjectFromList = function (key, index) {
        return pool.data[key] ? pool.data[key][index] : null;
    };

    return pool;
}

export { DataPool };






