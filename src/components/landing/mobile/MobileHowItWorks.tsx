const steps = [
  {
    number: "1",
    icon: "📋",
    title: "Buat Task",
    color: "bg-indigo-100 text-indigo-600",
  },

  {
    number: "2",
    icon: "🙋",
    title: "Helper\nMelamar",
    color: "bg-pink-100 text-pink-600",
  },

  {
    number: "3",
    icon: "🧑",
    title: "Pilih Helper",
    color: "bg-amber-100 text-amber-600",
  },

  {
    number: "4",
    icon: "🛡️",
    title: "Dikerjakan",
    color: "bg-emerald-100 text-emerald-600",
  },

  {
    number: "5",
    icon: "📍",
    title: "Beri Rating",
    color: "bg-violet-100 text-violet-600",
  },
];

export default function MobileHowItWorks() {
  return (
    <section className="px-0 pt-8">

      {/* HEADER */}
      <div className="text-center">

        <h2
          className="
            text-base
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Cara Kerja{" "}

          <span className="text-indigo-600">
            Help
          </span>

          <span className="text-amber-500">
            Me
          </span>

        </h2>

      </div>

      {/* STEPS */}
      <div
        className="
          mt-5
          flex
          items-start
          justify-between
          gap-1
          overflow-x-auto
          pb-2
          scrollbar-hide
        "
      >

        {steps.map((step, index) => (
          <div
            key={step.number}
            className="
              flex
              items-center
            "
          >

            {/* STEP */}
            <div
              className="
                flex
                min-w-[58px]
                flex-col
                items-center
              "
            >

              {/* ICON */}
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-base
                  ${step.color}
                `}
              >
                {step.icon}
              </div>

              {/* NUMBER */}
              <p
                className="
                  mt-2
                  text-xs
                  font-bold
                  text-slate-400
                "
              >
                {step.number}
              </p>

              {/* TITLE */}
              <p
                className="
                  mt-1
                  whitespace-pre-line
                  text-center
                  text-[11px]
                  font-semibold
                  leading-4
                  text-slate-700
                "
              >
                {step.title}
              </p>

            </div>

            {/* ARROW */}
            {index !== steps.length - 1 && (
              <div
                className="
                  mt-6
                  px-1
                  text-slate-300
                "
              >
                →
              </div>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}