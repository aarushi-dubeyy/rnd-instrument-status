/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useRouter } from "next/navigation";

export default function GraphicalView({ instrumentListData }: any) {
  const router = useRouter();
  const deptStatusMap: Record<string, { UP: number; DOWN: number }> = {};

  instrumentListData.forEach((ins: any) => {
    const dept = ins.deptname?.trim() || "Unknown";
    if (!deptStatusMap[dept]) {
      deptStatusMap[dept] = { UP: 0, DOWN: 0 };
    }
    if (ins.workingStatus === "UP") deptStatusMap[dept].UP += 1;
    else if (ins.workingStatus === "DOWN") deptStatusMap[dept].DOWN += 1;
  });

  console.log(instrumentListData);

  const departments = Object.keys(deptStatusMap);
  const upData = departments.map((dept) => deptStatusMap[dept].UP);
  const downData = departments.map((dept) => deptStatusMap[dept].DOWN);

  const data = [
    {
      id: "UP",
      value: instrumentListData.filter((ins: any) => ins.workingStatus === "UP")
        .length,
      label: `UP (${
        instrumentListData.filter((ins: any) => ins.workingStatus === "UP")
          .length
      })`,
      color: "	#00B8D4",
    },
    {
      id: "DOWN",
      value: instrumentListData.filter(
        (ins: any) => ins.workingStatus === "DOWN"
      ).length,
      label: `DOWN (${
        instrumentListData.filter((ins: any) => ins.workingStatus === "DOWN")
          .length
      })`,
      color: "	#FF7043",
    },
  ];

  return (
    <div className="flex flex-col h-full m-2 gap-4">
      <div className="flex flex-1">
        <PieChart
          //className="border"
          sx={{
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
            padding: 4,
          }}
          width={360}
          onItemClick={(e, d) => {
            const status = data[d.dataIndex].id;
            console.log(status);
            router.push(`/instrument-list/tabular-view?status=${status}`);
          }}
          series={[
            {
              data,
              innerRadius: 60,
              outerRadius: 140,
              paddingAngle: 2,
              cornerRadius: 2,
            },
          ]}
        />
        <PieChart
          sx={{
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          }}
          width={360}
          onItemClick={(e, d) => {
            const clicked = [
              {
                id: "IN_WARRANTY",
                value: instrumentListData.filter(
                  (ins: any) => ins.status === "IN_WARRANTY"
                ).length,
              },
              {
                id: "IN_AMC",
                value: instrumentListData.filter(
                  (ins: any) => ins.status === "IN_AMC"
                ).length,
              },
              {
                id: "NOT_AVAILABLE",
                value: instrumentListData.filter(
                  (ins: any) => ins.status === "NOT_AVAILABLE"
                ).length,
              },
            ][d.dataIndex];

            console.log(clicked);
            router.push("/instrument-list/tabular-view");
          }}
          series={[
            {
              data: [
                {
                  id: "IN_WARRANTY",
                  value: instrumentListData.filter(
                    (ins: any) => ins.status === "IN_WARRANTY"
                  ).length,
                  label: `IN_WARRANTY (${
                    instrumentListData.filter(
                      (ins: any) => ins.status === "IN_WARRANTY"
                    ).length
                  })`,
                  color: "rgba(52, 158, 105, 0.99)",
                },
                {
                  id: "IN_AMC",
                  value: instrumentListData.filter(
                    (ins: any) => ins.status === "IN_AMC"
                  ).length,
                  label: `IN_AMC (${
                    instrumentListData.filter(
                      (ins: any) => ins.status === "IN_AMC"
                    ).length
                  })`,
                  color: "#7E57C2",
                },
                {
                  id: "NOT_AVAILABLE",
                  value: instrumentListData.filter(
                    (ins: any) => ins.status === "NOT_AVAILABLE"
                  ).length,
                  label: `NOT_AVAILABLE (${
                    instrumentListData.filter(
                      (ins: any) => ins.status === "NOT_AVAILABLE"
                    ).length
                  })`,
                  color: "rgb(182, 136, 84)",
                },
              ],
              innerRadius: 60,
              outerRadius: 140,
              paddingAngle: 2,
              cornerRadius: 2,
            },
          ]}
        />
      </div>

      <div className="flex flex-col flex-1 items-center">
        <BarChart
          height={400}
          borderRadius={10}
          width={1800}
          onItemClick={() => {
            router.push("/instrument-list/tabular-view");
          }}
          sx={{
            boxShadow: "rgba(156, 161, 167, 0.2) 0px 8px 24px",
          }}
          // height={400}
          xAxis={[
            {
              scaleType: "band",
              data: departments,
              label: "Departments",
              categoryGapRatio: 0.5,
            },
          ]}
          yAxis={[{ label: "No. of Instruments" }]}
          series={[
            {
              data: upData,
              label: "UP",
              color: "#00B8D4",
              stack: "total",
            },
            {
              data: downData,
              label: "DOWN",
              color: "#FF7043",

              stack: "total",
            },
          ]}
        />
      </div>
    </div>
  );
}
