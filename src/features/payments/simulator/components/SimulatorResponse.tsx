import type { SimulatorResult } from "../types/simulatorResult";

interface Props {
  result: SimulatorResult;
}

export default function SimulatorResponse({ result }: Props) {
  const badgeClass =
    result.status === "SUCCESS"
      ? "bg-green-100 text-green-700"
      : result.status === "ERROR"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <div
      className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
            "
    >
      <div
        className="
                    mb-4
                    flex
                    items-center
                    justify-between
                "
      >
        <h3
          className="
                        font-semibold
                    "
        >
          Response
        </h3>

        <span
          className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-bold
                        ${badgeClass}
                    `}
        >
          {result.status}
        </span>
      </div>

      <div
        className="
                    mb-4
                    text-sm
                    text-slate-500
                "
      >
        Execution Time:{" "}
        <span
          className="
                        font-semibold
                    "
        >
          {result.executionTime} ms
        </span>
      </div>

      <pre
        className="
                    overflow-x-auto
                    rounded-xl
                    bg-slate-950
                    p-4
                    font-mono
                    text-sm
                    text-green-400
                "
      >
        {result.response || "Waiting for simulation..."}
      </pre>
    </div>
  );
}