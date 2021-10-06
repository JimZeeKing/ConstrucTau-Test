const { resourceLoader } = window.zeaEngine;

const loadLabels = (url) => {
  return new Promise((resolve) => {
    resourceLoader.loadFile("binary", url).then((arrayBuffer) => {
      const unit8array = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(unit8array, {
        type: "array",
      });
      const json = {};
      workbook.SheetNames.forEach(function (sheetName) {
        // Here is your object
        const rows = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        rows.forEach(function (row) {
          const identifier = row.Identifier;
          delete row.Identifier;
          json[identifier] = row;
        });
        resolve(json);
      });
    });
  });
};
export default loadLabels;
