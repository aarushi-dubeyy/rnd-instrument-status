/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "@/app/api/auth/session";
import fetchEmployeeList from "../api-fetch-employees-list";
import fetchInstrumentList from "../api-fetch-instruments-list";
import TabularView from "./client";

function getEmployeeLabel(username: string, employeeList: any = []) {
  const index = employeeList.findIndex((emp: any) => emp.username === username);
  if (index < 0) {
    return "--";
  }
  const option = employeeList[index];
  const name = option?.name || "",
    designation = option?.designation || "NA",
    uname = option?.username || "NA",
    department = option?.department || "NA";

  return option ? `${name} [${designation}] [${uname}] - ${department}` : "";
}

export default async function TabularViewServer() {
  const session = await getSession();
  const instrumentList = await fetchInstrumentList();
  const employeeList = await fetchEmployeeList();
  const uniqueDepartments = Object.values(
    employeeList.reduce((acc: any, curr: any) => {
      acc[curr.departmentCodeUnique] = {
        department: curr.department,
        departmentCodeUnique: curr.departmentCodeUnique,
      };
      return acc;
    }, {})
  );

  return (
    <TabularView
      instrumentListData={instrumentList
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ) // 🔁 Sort descending
        .map((ins: any) => ({
          ...ins,
          fprUserName: ins.fpr,
          id: ins.instrumentId,
          departmentName:
            uniqueDepartments.find(
              (dept: any) => dept.departmentCodeUnique === ins.departmentCode
            )?.department || "--",
          fpr: getEmployeeLabel(ins.fpr, employeeList),
        }))}
      employeeList={employeeList}
      loggedInUser={session?.user.username}
      fpr
    />
  );
}
