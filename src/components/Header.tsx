import { Dispatch, SetStateAction } from 'react';
import Search from '../../public/search.json';

interface Props {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
  setInfo: Dispatch<SetStateAction<any>>;
}

export default function Header({
  search,
  setSearch,
  setName,
  setInfo,
}: Props) {
  return (
    <header className="w-full mt-3 flex flex-col">
      <div className="flex flex-row px-4 justify-between items-between w-full">
        <div className="flex flex-row space-x-3">
          <button
            onClick={() => {
              setName('');
            }}
          >
            <img
              src="/cybersyn.jpg"
              className="h-[32px] hidden md:flex my-auto w-[32px]"
            />
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setName(search);
            }}
            className="flex flex-row space-x-4"
          >
            <input
              list="companies"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="border px-3 py-1 bg-gray-50 rounded text-sm focus:outline-none focus:ring-0 font-medium text-[#363636] my-auto"
              placeholder="Ticker..."
              type="text"
            />
            <datalist id="companies">
              {Search.map((item: any, index: number) => {
                return (
                  <option
                    key={index}
                    value={item.name}
                    onSelect={(e) => {
                      e.preventDefault();
                      setInfo(item);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setInfo(item);
                    }}
                  />
                );
              })}
            </datalist>
            <button
              type="submit"
              className="text-sm font-medium text-white px-4 py-1 rounded bg-gray-900 hover:opacity-90"
            >
              Search
            </button>
          </form>
        </div>
        <div className=""></div>
        <div className="flex flex-row space-x-2">
          <a
            href="https://cybersyn.com"
            target="_blank"
            rel="noopenner noreferrer"
            className="hidden md:flex bg-[#424162] px-4 py-1.5 rounded-lg text-sm hover:opacity-90 font-medium text-white"
          >
            <p>Info</p>
          </a>
          <a
            href="https://app.snowflake.com/marketplace/listings/Cybersyn%2C%20Inc"
            target="_blank"
            rel="noopenner noreferrer"
            className="hidden md:flex bg-[#2A2746] px-4 py-1.5 rounded-lg text-sm hover:opacity-90 font-medium text-white"
          >
            Access Data
          </a>
        </div>
      </div>
      <hr className="mt-3 w-full" />
    </header>
  );
}
