import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import React, { useState, useContext } from "react";
import { LoadingContext } from "../../context/Loading";
import { useHistory } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import pageURL from "../../utils/pageUrls";
import { useFetch } from "../../hooks/use-fetch";
import { getAuthority } from "../../service/authority";
import { Paginator } from "primereact/paginator";
import { Authority } from "../../utils/authority";
import ActionButtons from "../../components/ActionButtons";
import { exportExcel } from "../../utils/exportExcel";
import { tryCatch } from "@thalesrc/js-utils";

const Authorities = () => {
  const { push } = useHistory();
  const { setLoading } = useContext(LoadingContext);
  const [payload, setPayload] = useState({ page: 1, pageSize: 50, isActive: true });
  const [first, setFirst] = useState(0);
  const [authority] = useFetch(() => getAuthority(payload), {}, { setLoading, reloadDeps: [payload], deps: [payload] });
  const items = [
    {
      label: "Üst Yetki Id",
      name: "parentId",
      component: "input",
      type: "text",
      keyfilter: "pnum",
    },
    {
      label: "Ad",
      name: "name",
      component: "input",
      type: "text",
    },
    {
      label: "Kodu",
      name: "code",
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
    const [, res] = await tryCatch(getAuthority({ pageSize: -1 }));

    exportExcel(res.results, "authority");
  };

  const renderHeader = () => <Button label="Dışa Aktar" type="button" icon="pi pi-file-excel" onClick={() => handleExport()} className="p-button-success mr-2" data-pr-tooltip="XLS" />;

  return (
    <div className="grid">
      <div className="col-12">
        <SearchBar items={items} handleSearch={(data) => handleSearch(data)} />
        <div className="card">
          <h2>Yetki Yönetimi</h2>
          <Divider />
          <ActionButtons>
            <Button code={Authority.AuthorityManagment_Insert} label="Ekle" onClick={() => push(`${pageURL.Authority}/add`)} />
          </ActionButtons>
          <Divider />
          <DataTable header={renderHeader} value={authority?.results} showGridlines rows={50} dataKey="id" filterDisplay="menu" responsiveLayout="scroll" emptyMessage="Veri bulunamadı.">
            <Column sortable field="id" header="No" style={{ minWidth: "12rem" }} />
            <Column sortable field="name" header="Ad" style={{ minWidth: "12rem" }} />
            <Column sortable field="description" header="Açıklama" style={{ minWidth: "12rem" }} />
            <Column sortable field="parentId" header="Üst Yetki Id" style={{ minWidth: "12rem" }} />
            <Column sortable field="code" header="Kod" style={{ minWidth: "12rem" }} />
            <Column body={(rowData) => (rowData?.isActive ? "Aktif" : "Pasif")} header="Durum" style={{ minWidth: "12rem" }} />
            <Column
              header="Aksiyon"
              body={(rowData) => {
                return (
                  <ActionButtons>
                    <Button code={Authority.AuthorityManagment_Edit} type="button" label="Düzenle" onClick={() => push(`${pageURL.Authority}/edit/${rowData.id}`)} />
                  </ActionButtons>
                );
              }}
            />
          </DataTable>
          <Paginator first={first} rows={50} totalRecords={authority.rowCount} onPageChange={(e) => onPageChange(e)}></Paginator>
        </div>
      </div>
    </div>
  );
};

export default Authorities;
