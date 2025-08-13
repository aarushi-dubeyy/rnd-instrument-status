/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllEmployees } from "@/app/utils/employee";
import fetchInstrumentList from "../api-fetch-instruments-list";
import fetchEmployeeList from "../api-fetch-employees-list";
import GraphicalView from "./client";

export default async function GraphicalViewServer() {
  const instrumentList = await fetchInstrumentList();
  const employeeList = await fetchEmployeeList();

  const deptMap = employeeList.reduce((acc: any, emp: any) => {
    if (emp.departmentCodeUnique && emp.department) {
      acc[emp.departmentCodeUnique] = emp.department;
    }
    return acc;
  }, {});

  const enrichedInstrumentList = instrumentList.map((ins: any) => {
    const matchedDeptName = deptMap[ins.departmentCode];
    return {
      ...ins,
      deptname: matchedDeptName || "Unknown",
    };
  });

  return <GraphicalView instrumentListData={enrichedInstrumentList} />;
}
