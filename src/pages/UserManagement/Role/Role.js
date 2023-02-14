/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Paginator } from "primereact/paginator";
import React, { useContext, useState } from "react";
import SearchBar from "../../../components/SearchBar";
import { LoadingContext } from "../../../context/Loading";
import { useFetch } from "../../../hooks/use-fetch";
import { getRoles } from "../../../service/user";
import { useHistory } from "react-router-dom";
import pageURL from "../../../utils/pageUrls";
import { Authority } from "../../../utils/authority";
import ActionButtons from "../../../components/ActionButtons";
import { exportExcel } from "../../../utils/exportExcel";
import { tryCatch } from "@thalesrc/js-utils";

function Role() {
  const { push } = useHistory();
  const { setLoading } = useContext(LoadingContext);
  const [first, setFirst] = useState(0);
  const [payload, setPayload] = useState({
    page: 1,
    pageSize: 50,
    isActive: true
  });

  const [roles] = useFetch(() => getRoles(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });

  const items = [
    {
      label: "Kod",
      name: "code",
      component: "input",
      type: "text",
    },
    {
      label: "Rol Adı",
      name: "name",
      component: "input",
      type: "text",
    },
    {
      label: "Üst Rol Id",
      name: "parentId",
      component: "input",
      type: "text",
    },
    {
      label: "Durum",
      name: "isActive",
      component: "dropdown",
      options: [
        { label: "Aktif", value: true },
        { label: "Pasif", value: false },
      ],
    },
  ];

  const handleSearch = (data) => {
    setPayload((prevState) => ({
      ...prevState,
      ...data,
    }));
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setPayload((prevState) => ({
      ...prevState,
      page: event.page + 1,
    }));
  };

  const handleExport = async () => {
    const [, res] = await tryCatch(getRoles({ pageSize: -1 }));

    exportExcel(res.results, "roles");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h5>Rol Listesi</h5>
          <Divider />
          <ActionButtons>
            <Button code={Authority.RoleManagement_Insert} label="Ekle" onClick={() => push(pageURL.RoleManagement + "/add")} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={roles?.results} showGridlines rows={50} responsiveLayout="scroll" emptyMessage="Veri bulunmamaktadır.">
            <Column sortable field="name" header="Rol Adı" style={{ minWidth: "12rem" }} />
            <Column sortable field="description" header="Açıklama" style={{ minWidth: "12rem" }} />
            <Column header="Durum" style={{ minWidth: "12rem" }} body={(rowData) => (rowData.isActive ? "Aktif" : "Pasif")} />
            <Column
              header="Aksiyon"
              headerStyle={{ width: "4rem", textAlign: "center" }}
              bodyStyle={{ textAlign: "center", overflow: "visible" }}
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.RoleManagement_Edit} type="button" label="Düzenle" onClick={() => push(pageURL.RoleManagement + "/edit/" + rowData.id)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={roles.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
    </div>
  );
}

export default Role;
