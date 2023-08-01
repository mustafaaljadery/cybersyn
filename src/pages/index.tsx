import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import Search from '../../public/search.json';
import Head from 'next/head';

// format date
function formatDate(date: string) {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white flex flex-col space-y-1 p-4 border rounded">
        <span className="text-sm font-regular text-gray-600">
          {formatDate(label)}
        </span>
        <p className="text-2xl font-semibold text-gray-900">
          {`${formatLargeNumber(payload[0].value, 2)} ${
            payload[0].payload.unit
          }`}
        </p>
      </div>
    );
  }

  return null;
};

// format large number include negatives for example, 1000 is 1k
function formatLargeNumber(num: number, digits: number) {
  const sign = Math.sign(num);
  num = Math.abs(num);
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

  let i;

  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }

  return (
    ((num * sign) / si[i].value).toFixed(digits).replace(rx, '$1') +
    si[i].symbol
  );
}

interface ChartProps {
  data: any;
}

async function getTicker(name: string) {
  try {
    const result = await axios.post('/api/snowflake', {
      name: name,
    });
    return result.data;
  } catch (e) {
    console.log(e);
  }
}

function Chart({ data }: ChartProps) {
  return (
    <div className="w-full flex flex-col space-y-4 p-3 border border-[#2A2746]">
      <p className="text-xl font-semibold text-gray-900">
        {data?.name}
      </p>
      <ResponsiveContainer height={300} width="100%">
        <LineChart data={data.data}>
          <CartesianGrid vertical={false} opacity="0.2" />
          <Tooltip content={<CustomTooltip />} />
          <XAxis
            tick={{ fill: 'black' }}
            axisLine={false}
            tickLine={false}
            dataKey="label"
            style={{
              marginTop: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
            tickFormatter={(tick) => {
              return `${formatDate(tick)}`;
            }}
          />
          <YAxis
            domain={[
              Math.min(...data.data.map((val: any) => val.value)),
              Math.max(...data.data.map((val: any) => val.value)) *
                1.2,
            ]}
            tickCount={9}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'black' }}
            type="number"
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
            }}
            tickFormatter={(tick) => {
              return `${formatLargeNumber(tick, 1)}`;
            }}
          />
          <Line
            dot={false}
            strokeWidth={2}
            stroke="#2A2746"
            className=""
            type="monotone"
            dataKey="value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<any>([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState<string>('');
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (name.length > 0) {
      setIsLoading(true);
      setInfo(Search.find((val: any) => val.name === name));
      getTicker(name).then((value) => {
        setData(value);
        setIsLoading(false);
      });
    }
  }, [name]);

  return (
    <>
      <Head>
        <title>Cybersyn Demo - Max Aljadery</title>
      </Head>
      <div className="flex flex-col w-full">
        <Header
          search={search}
          setSearch={setSearch}
          setName={setName}
          setInfo={setInfo}
        />
        <main className="flex flex-col w-full justify-center items-center mt-8 pb-16">
          {name.length > 0 ? (
            <div className="flex flex-col justify-start items-start w-full space-y-6">
              <div className="flex flex-row justify-between items-between px-4 md:px-12 w-full">
                <div className="flex flex-col space-y-1.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {name}
                  </h1>
                  <p className="text-sm font-medium text-gray-500">{`${info?.city}, ${info?.state}`}</p>
                </div>
                <p className="text-sm font-regular text-gray-500 my-auto">
                  All data is the sum of the end-period.
                </p>
              </div>
              {isLoading ? (
                <div className="w-full px-12 pt-10 flex flex-row space-x-3 justify-center items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin my-auto"
                  >
                    <g clipPath="url(#clip0_1405_2)">
                      <path
                        d="M4.84457 21.6005C4.13345 21.0227 3.95568 20.0005 4.53345 19.2449C5.11123 18.5338 6.13345 18.3116 6.88901 18.8894C7.24457 19.1116 7.55568 19.3783 7.95568 19.556C11.289 21.3783 15.4223 20.756 18.089 18.0449C18.7557 17.3783 19.7779 17.3783 20.4446 18.0449C21.0668 18.7116 21.0668 19.7783 20.4446 20.4005C16.7112 24.1783 10.9335 25.1116 6.31123 22.5338C5.7779 22.2671 5.28901 21.9116 4.84457 21.6005Z"
                        fill="#2A2746"
                      />
                      <path
                        d="M23.8224 13.9555C23.6891 14.8888 22.8002 15.511 21.8669 15.3777C20.9335 15.2444 20.3558 14.3555 20.4891 13.4221C20.578 12.9332 20.578 12.4444 20.578 11.9555C20.578 8.0888 18.0446 4.75547 14.4891 3.73325C13.6002 3.51103 13.0669 2.53325 13.3335 1.64436C13.6002 0.755471 14.4891 0.222137 15.4224 0.488804C20.4446 1.95547 23.9558 6.62214 23.9558 11.9999C23.9558 12.6666 23.9113 13.3332 23.8224 13.9555Z"
                        fill="#2A2746"
                      />
                      <path
                        d="M7.42222 0.843445C8.26667 0.487889 9.24445 0.932334 9.55556 1.82122C9.86667 2.71011 9.46667 3.68789 8.62222 4.04344C5.42222 5.33233 3.28889 8.48789 3.28889 12.0879C3.28889 12.799 3.37778 13.5101 3.55556 14.1768C3.77778 15.0657 3.24444 15.999 2.35556 16.2212C1.46667 16.4434 0.577778 15.9101 0.355556 14.9768C0.133333 13.999 0 13.0212 0 12.0434C0 7.02122 2.97778 2.62122 7.42222 0.843445Z"
                        fill="#2A2746"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1405_2">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <p className="text-xl font-bold my-auto text-gray-900">
                    Loading Data...
                  </p>
                </div>
              ) : (
                <div className="flex flex-row flex-wrap px-8">
                  {data.map((item: any, index: number) => {
                    return (
                      <div className="p-2 md:p-4 w-full md:w-1/2">
                        <Chart data={item} key={index} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-5xl text-center pt-8 font-bold text-[#424162]">
                Research Company Data
              </h1>
              <p className="mt-6 font-medium text-[#424162] text-center">
                Using the Cybersyn dataset, research a company by
                entering name or Ticker.
              </p>
              <div className="mt-8 flex flex-row space-x-1">
                <p className="font-semibold text-[#363636]">
                  Created By:
                </p>
                <a
                  target="_blank"
                  rel="noopenner noreferrer"
                  href="https://maxaljadery.com"
                  className="font-semibold text-blue-900 hover:underline"
                >
                  Max Aljadery
                </a>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
