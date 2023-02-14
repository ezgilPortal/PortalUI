export const exportExcel = (data, name) => {
  import("xlsx").then((xlsx) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    saveAsExcelFile(excelBuffer, name);
  });
};

const saveAsExcelFile = (buffer, fileName) => {
  import("file-saver").then((FileSaver) => {
    let EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    let EXCEL_EXTENSION = ".xlsx";
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.default.saveAs(data, fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION);
  });
};
