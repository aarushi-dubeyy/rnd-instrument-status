/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tabs,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { toast } from "sonner";
import Tab from "@mui/material/Tab";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { addInstrument } from "@/server-actions/add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridRowModel } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import FormTextField from "@/core-components/form-components/FormTextField";
import AlertDialogSlide from "@/core-components/AlertDialogSlide";
import { FormAutocomplete } from "@/core-components";
import { STATUS, WORKING_STATUS } from "@/app/enums";
import { instrumentRequest } from "@/server-actions/action";
import { Employee } from "@/database/models";
import { deleteInstrumentRequest } from "@/server-actions/delete";
import { Grid } from "@mui/material";

import { useSearchParams } from "next/navigation";

export function CircularIndeterminate() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
}
export default function TabularView({
  instrumentListData,
  employeeList,
  loggedInUser,
}: any) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const loggedInUserObject = employeeList.find(
    (emp: any) => emp.username === loggedInUser
  );

  const departmentMap = new Map<string, { code: string; name: string }>();

  employeeList.forEach((emp: any) => {
    if (emp?.department && emp?.departmentCodeUnique) {
      departmentMap.set(emp.departmentCodeUnique, {
        code: emp.departmentCodeUnique,
        name: emp.department,
      });
    }
  });
  const department = Array.from(departmentMap.values());
  const [workingStatusTab, setWorkingStatusTab] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [current, setCurrent] = useState(false);
  const [view, setView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editData, setEditData] = useState<any>();
  const initialValues = {
    internalOrderNumber: "",
    assetNumber: "",
    instrumentId: "",
    instrumentName: "",
    fpr: null,
    labName: "",
    roomNumber: "",
    status: "",
    workingStatus: "",
    workingStatusRemarks: "",
    departmentCode: { name: "", code: "" },
  };
  const methods = useForm({ defaultValues: initialValues });
  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    getValues,

    formState: { errors },
  } = methods;

  useEffect(() => {
    if (statusParam === "UP") setWorkingStatusTab(1);
    else if (statusParam === "DOWN") setWorkingStatusTab(2);
    else setWorkingStatusTab(0);
  }, [statusParam]);

  const columns: GridColDef<any>[] = [
    { field: "internalOrderNumber", headerName: "IO Number", flex: 0.75 },
    { field: "assetNumber", headerName: "Asset Id", flex: 0.5 },
    { field: "instrumentName", headerName: "Instrument Name", flex: 2 },
    { field: "departmentName", headerName: "Department Name", flex: 1 },
    { field: "labName", headerName: "Lab Name", flex: 1 },
    { field: "roomNumber", headerName: "Room Number", flex: 1 },
    {
      field: "fpr",
      headerName: "First Person Responsible",
      flex: 2,
    },
    {
      field: "workingStatus",
      headerName: "Working Status",
      flex: 1,
      // align: "center",
      headerAlign: "center",
      renderCell: (params: any) => {
        return params.row.workingStatus === "UP" ? (
          <>
            <ArrowCircleUpIcon color="success" sx={{ marginRight: 2 }} /> UP
          </>
        ) : (
          <>
            <ArrowCircleDownIcon color="error" sx={{ marginRight: 2 }} />
            DOWN
          </>
        );
      },
    },
    { field: "status", headerName: "Warranty / AMC", flex: 1 },
    {
      field: "workingStatusRemarks",
      headerName: "Working Status Remarks",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
          <Button
            variant="text"
            size="small"
            color="primary"
            disabled={loggedInUser != params.row.fprUserName}
            onClick={() => {
              setEditData(params.row);
              if (
                initialValues.instrumentName != params.row.instrumentName &&
                initialValues.instrumentId != params.row.instrumentId &&
                initialValues.assetNumber != params.row.assetNumber
              ) {
                reset({
                  internalOrderNumber: params.row?.internalOrderNumber,
                  instrumentName: params.row?.instrumentName,
                  instrumentId: params.row?.instrumentId,
                  assetNumber: params.row?.assetNumber,
                  status: params.row?.status,
                  labName: params.row?.labName,
                  roomNumber: params.row?.roomNumber,
                  workingStatus: params.row?.workingStatus,
                  workingStatusRemarks: "",
                  fpr: employeeList.find(
                    (emp: any) => emp.username === params.row.fprUserName
                  ) || { username: params.row.fprUserName },
                  departmentCode: {
                    name: params.row?.departmentName,
                    code: params.row?.departmentCode,
                  },
                  // departmentCode: "Tribology",
                });
              }
              // console.log(initialValues);
              setOpenEdit(true);
              setLoading(false);
            }}
          >
            <EditIcon />
          </Button>
        </Stack>
      ),
    },
  ];
  return (
    <div className="">
      <div className="flex m-4">
        <div className="flex-1">
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "",
              // marginBottom: 2,
            }}
          >
            <div className="flex justify-between items-center m-4">
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "",
                  width: "100%",
                }}
              >
                <Tabs
                  value={workingStatusTab}
                  onChange={(e, newval) => setWorkingStatusTab(newval)}
                  variant="fullWidth"
                >
                  <Tab value={0} label={"ALL"} />
                  <Tab
                    value={1}
                    label={
                      <div className="flex items-center">
                        <ArrowCircleUpIcon
                          color="success"
                          sx={{ marginRight: 2 }}
                        />{" "}
                        UP
                      </div>
                    }
                  />
                  <Tab
                    value={2}
                    label={
                      <div className="flex items-center">
                        <ArrowCircleDownIcon
                          color="error"
                          sx={{ marginRight: 2 }}
                        />{" "}
                        DOWN
                      </div>
                    }
                  />
                </Tabs>
              </Box>

              {/* + Add Button */}
              {
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    !((loggedInUserObject?.grade || "").toUpperCase() >= "F")
                  }
                  onClick={() => {
                    reset(initialValues); // reset to default values
                    setOpenAdd(true); // open the dialog
                  }}
                  sx={{ height: "fit-content", ml: 2 }}
                >
                  ADD
                </Button>
              }
            </div>
          </Box>
          <DataGrid
            columns={columns}
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: "updatedAt", sort: "desc" }],
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            showToolbar
            rows={instrumentListData.filter((ins: any) => {
              if (workingStatusTab === 0) return true;
              if (workingStatusTab === 1) {
                if (ins.workingStatus === "UP") {
                  return true;
                }
                return false;
              }
              if (workingStatusTab === 2) {
                if (ins.workingStatus === "DOWN") {
                  return true;
                }
                return false;
              }
            })}
          />
        </div>
      </div>
      <Dialog
        open={openEdit}
        onClose={() => (setOpenEdit(false), setView(false), reset())}
      >
        <>
          {current && (
            <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-50">
              <CircularIndeterminate />
            </div>
          )}
          <DialogTitle>Change Instrument Data</DialogTitle>
          <DialogContent
            sx={{
              bgcolor: "background.default",
              color: "text.primary",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            Fill the form and click on submit to change instrument data.
            <div className="p-4 mt-4 max-w-[1800px]">
              <FormTextField
                control={control}
                name="internalOrderNumber"
                label="IO Number"
                // rules={{ required: true }}
                error={errors["internalOrderNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="assetNumber"
                label="Asset Number"
                // rules={{ required: true }}
                error={errors["assetNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="instrumentName"
                label="Instrument Name *"
                rules={{ required: true }}
                error={errors["instrumentName"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="labName"
                label="Lab Name *"
                rules={{ required: true }}
                error={errors["labName"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="roomNumber"
                label="Room Number"
                // rules={{ required: true }}
                error={errors["roomNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="fpr"
                label="FPR *"
                rules={{ required: true }}
                options={
                  employeeList
                    .filter(
                      (emp: any) =>
                        emp.rndStatus === "ACTIVE" && emp.isEmployee === 1
                    )
                    .sort((a: any, b: any) => a.name.localeCompare(b.name)) ||
                  []
                }
                getOptionLabel={(option: any) =>
                  `${option.name} (${option.username}) - ${option.designation} (${option.department})`
                }
                isOptionEqualToValue={(option: any, value: any) =>
                  option.username === value.username
                }
                error={errors["fpr"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="departmentCode"
                label="Department *"
                rules={{ required: true }}
                options={
                  department.sort((a: any, b: any) =>
                    a.name.localeCompare(b.name)
                  ) || []
                }
                getOptionLabel={(option: any) => option.name}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.name === value.name
                }
                error={errors["departmentCode"]}
                sx={{ marginBottom: 2 }}
              />

              <FormAutocomplete
                control={control}
                name="status"
                label="Status *"
                options={Object.keys(STATUS)}
                isOptionEqualToValue={(option: any, value: any) =>
                  option === value
                }
                rules={{ required: true }}
                error={errors["status"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="workingStatus"
                label="Working Status *"
                options={Object.keys(WORKING_STATUS)}
                isOptionEqualToValue={(option: any, value: any) =>
                  option === value
                }
                rules={{ required: true }}
                error={errors["workingStatus"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="workingStatusRemarks"
                label="Working Status Remarks"
                // rules={{ required: true }}
                error={errors["workingStatusRemarks"]}
                sx={{ marginBottom: 2 }}
              />
            </div>
            <div
              className="flex-col mx-2 -mt-2 max-w-[1800px] "
              style={{ width: "700px" }}
            >
              <div
                className="flex gap-4 justify-start mx-2 mt-4 mb-2 max-w-[1800px] "
                style={{ width: "-webkit-fill-available" }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  style={{
                    minWidth: "150px",
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    marginRight: "8px",
                  }}
                  onClick={() => {
                    setOpenEdit(false);
                    setView(false);
                    reset();
                  }}
                  color="primary"
                >
                  Cancel
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  style={{
                    minWidth: "150px",
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                  }}
                  startIcon={<DoneIcon />}
                  onClick={handleSubmit(async (formData) => {
                    setCurrent(true);
                    // console.log(formData);
                    try {
                      await instrumentRequest(formData);
                      toast.success("Status Changed!");
                    } catch (error: any) {
                      if (error.message === "Failed to fetch") {
                        toast.error("NOT_AUTHORIZED");
                      } else {
                        toast.error(error.message);
                      }
                    }
                    reset();
                    setOpenEdit(false);
                    setView(false);
                    setCurrent(false);
                  })}
                >
                  Change
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  style={{
                    minWidth: "150px",
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                  }}
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={async () => {
                    try {
                      const instrumentId = editData?.instrumentId;

                      if (!instrumentId) {
                        console.error("Instrument ID is missing:", editData);
                        toast.error("Instrument ID not found. Cannot delete.");
                        return;
                      }

                      console.log("Deleting Instrument ID:", instrumentId);

                      await deleteInstrumentRequest({ instrumentId });

                      toast.success("Instrument Deleted!");
                      setOpenEdit(false);
                      setView(false);
                    } catch (error: any) {
                      if (error.message === "Failed to fetch") {
                        toast.error(
                          "You are not authorized to delete this instrument."
                        );
                      } else {
                        toast.error(
                          error.message ||
                            "Something went wrong while deleting."
                        );
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </>
      </Dialog>
      {/*add*/}
      <Dialog
        open={openAdd}
        onClose={() => (setOpenAdd(false), setView(false), reset())}
      >
        <>
          {current && (
            <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-50">
              <CircularIndeterminate />
            </div>
          )}
          <DialogTitle>Add Instrument Data</DialogTitle>
          <DialogContent
            sx={{
              bgcolor: "background.default",
              color: "text.primary",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            Fill the form and click on submit to add instrument data.
            <div className="p-4 mt-4 max-w-[1800px]">
              <FormTextField
                control={control}
                name="internalOrderNumber"
                label="IO Number"
                // rules={{ required: true }}
                error={errors["internalOrderNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="assetNumber"
                label="Asset Number"
                // rules={{ required: true }}
                error={errors["assetNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="instrumentName"
                label="Instrument Name *"
                rules={{ required: true }}
                error={errors["instrumentName"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="labName"
                label="Lab Name *"
                rules={{ required: true }}
                error={errors["labName"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="roomNumber"
                label="Room Number"
                // rules={{ required: true }}
                error={errors["roomNumber"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="fpr"
                label="FPR *"
                rules={{ required: true }}
                options={
                  employeeList
                    .filter(
                      (emp: any) =>
                        emp.rndStatus === "ACTIVE" && emp.isEmployee === 1
                    )
                    .sort((a: any, b: any) => a.name.localeCompare(b.name)) ||
                  []
                }
                getOptionLabel={(option: any) =>
                  `${option.name} (${option.username}) - ${option.designation} (${option.department})`
                }
                isOptionEqualToValue={(option: any, value: any) =>
                  option.username === value.username
                }
                error={errors["fpr"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="departmentCode"
                label="Department *"
                rules={{ required: true }}
                options={
                  department.sort((a: any, b: any) =>
                    a.name.localeCompare(b.name)
                  ) || []
                }
                getOptionLabel={(option: any) => option.name}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.name === value.name
                }
                error={errors["departmentCode"]}
                sx={{ marginBottom: 2 }}
              />

              <FormAutocomplete
                control={control}
                name="status"
                label="Status *"
                options={Object.keys(STATUS)}
                isOptionEqualToValue={(option: any, value: any) =>
                  option === value
                }
                rules={{ required: true }}
                error={errors["status"]}
                sx={{ marginBottom: 2 }}
              />
              <FormAutocomplete
                control={control}
                name="workingStatus"
                label="Working Status *"
                options={Object.keys(WORKING_STATUS)}
                isOptionEqualToValue={(option: any, value: any) =>
                  option === value
                }
                rules={{ required: true }}
                error={errors["workingStatus"]}
                sx={{ marginBottom: 2 }}
              />
              <FormTextField
                control={control}
                name="workingStatusRemarks"
                label="Working Status Remarks"
                // rules={{ required: true }}
                error={errors["workingStatusRemarks"]}
                sx={{ marginBottom: 2 }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <div
              className="flex-col mx-2 -mt-2 max-w-[1800px] "
              style={{ width: "700px" }}
            >
              <div
                className="flex gap-4 justify-end mx-2 mt-4 mb-2 max-w-[1800px] "
                style={{ width: "-webkit-fill-available" }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  style={{ width: "-webkit-fill-available" }}
                  onClick={() => {
                    setOpenAdd(false);
                    setView(false);
                    reset();
                  }}
                  color="primary"
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  loading={adding}
                  onClick={handleSubmit(async (formValues) => {
                    try {
                      setAdding(true);
                      const result = await addInstrument(formValues); // call backend
                      setAdding(false);
                      if (result.success) {
                        toast.success(result.message);
                        setOpenAdd(false);
                        reset();
                      } else {
                        toast.error(result.message);
                        setOpenAdd(false);
                      }
                    } catch (error) {
                      toast.error("Something went wrong!");
                      setOpenAdd(false);
                      setAdding(false);
                      console.error(error);
                    }
                  })}
                >
                  ADD
                </Button>
              </div>
            </div>
          </DialogActions>
        </>
      </Dialog>
    </div>
  );
}
