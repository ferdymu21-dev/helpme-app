type Props = {

  loading: boolean;

};

export default function ActionBar({

  loading,

}: Props) {

  return (

    <>

      {/* Desktop */}

      <button
        type="submit"
        disabled={loading}
        className="
          hidden
          h-14
          w-full
          items-center
          justify-center
          rounded-2xl
          bg-indigo-600
          text-sm
          font-bold
          text-white
          shadow-lg
          shadow-indigo-600/20
          transition
          hover:bg-indigo-700
          disabled:cursor-not-allowed
          disabled:bg-slate-300
          sm:flex
        "
      >
        {loading
          ? "Mencari helper..."
          : "Cari Bantuan"}
      </button>

      {/* Mobile */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-40
          border-t
          border-slate-200
          bg-white/95
          p-4
          backdrop-blur-xl
          sm:hidden
        "
      >
        <div className="mx-auto max-w-3xl">

          <button
            type="submit"
            form="create-task-form"
            disabled={loading}
            className="
              flex
              h-13
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              text-sm
              font-bold
              text-white
              shadow-[0_12px_30px_rgba(79,70,229,0.28)]
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-slate-300
            "
          >
            {loading
              ? "Mencari helper..."
              : "Cari Bantuan"}
          </button>

        </div>

      </div>

    </>

  );

}