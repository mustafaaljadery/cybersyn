import type { NextApiRequest, NextApiResponse } from "next"
const snowflake = require('snowflake-sdk');

async function getValues(allRows: any, name: string) {
  const rows = allRows.filter((row: any) => row["MEASURE_DESCRIPTION"] === name).sort((a: any, b: any) => new Date(a["PERIOD_END_DATE"]).getTime() - new Date(b["PERIOD_END_DATE"]).getTime()).map((row: any) => {
    return {
      label: row["PERIOD_END_DATE"],
      value: row["VALUE"],
      unit: row["UNIT_OF_MEASURE"],
    }
  })

  const values: any = {}

  for (let i = 0; i < rows.length; i++) {
    if (values[rows[i]["label"]]) {
      // add values
      values[rows[i]["label"]] = Number(values[rows[i]["label"]]) + Number(rows[i]["value"])
    }
    else {
      values[rows[i]["label"]] = Number(rows[i]["value"])
    }
  }

  let sortable: any = [];

  for (const key in values) {
    sortable.push({
      label: key,
      value: values[key],
      unit: rows[0]["unit"],
    });
  }

  sortable = sortable.sort(function (a: any, b: any) {
    return new Date(a["label"]).getTime() - new Date(b["label"]).getTime();
  })

  return sortable
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body

  console.log(process.env.ACCOUNT)
  console.log(process.env.S_USERNAME)
  console.log(process.env.PASSWORD)
  console.log(process.env.AUTHENTICATOR)
  console.log(process.env.DATABASE)

  const connection = await snowflake.createConnection({
    account: process.env.ACCOUNT,
    username: process.env.S_USERNAME,
    password: process.env.PASSWORD,
    authenticator: process.env.AUTHENTICATOR,
    database: process.env.DATABASE,
  });

  await connection.connect();

  connection.execute({
    sqlText: `SELECT * FROM cybersyn.sec_cik_index AS i JOIN cybersyn.sec_report_attributes AS r ON (r.cik = i.cik) WHERE i.COMPANY_NAME='${name}';`,
    complete: async function (err: any, stmt: any, rows: any) {
      if (err) {
        console.error('Failed to execute statement due to the following error: ' + err.message);
      } else {
        const value: any = {}

        for (let i = 0; i < rows.length; i++) {
          if (value[rows[i]["MEASURE_DESCRIPTION"]]) {
            value[rows[i]["MEASURE_DESCRIPTION"]] = value[rows[i]["MEASURE_DESCRIPTION"]] + 1
          }
          else {
            value[rows[i]["MEASURE_DESCRIPTION"]] = 1
          }
        }

        const sortable = [];

        for (const key in value) {
          sortable.push([key, value[key]]);
        }

        sortable.sort(function (a, b) {
          return b[1] - a[1];
        });

        const top12 = sortable.slice(0, 12)

        const values = await Promise.all([
          getValues(rows, top12[0][0]),
          getValues(rows, top12[1][0]),
          getValues(rows, top12[2][0]),
          getValues(rows, top12[3][0]),
          getValues(rows, top12[4][0]),
          getValues(rows, top12[5][0]),
          getValues(rows, top12[6][0]),
          getValues(rows, top12[7][0]),
          getValues(rows, top12[8][0]),
          getValues(rows, top12[9][0]),
          getValues(rows, top12[10][0]),
          getValues(rows, top12[11][0]),
        ])

        let result: any = []

        for (let i = 0; i < values.length; i++) {
          result.push({
            "name": top12[i][0],
            "data": values[i]
          })
        }

        res.status(200).json(result)
      }
    }
  });
}