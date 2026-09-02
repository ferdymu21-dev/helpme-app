import DonationAmountCard from "./DonationAmountCard";

const amounts = [
  5000,
  10000,
  20000,
  50000,
];

interface Props {
  selectedAmount: number;

  onSelect: (
    amount: number,
  ) => void;
}

export default function DonationAmountGrid({
  selectedAmount,
  onSelect,
}: Props) {
  return (
    <section
      className="
        px-5
        pb-4
        pt-5
        sm:px-6
        sm:pt-6
      "
    >
      <div>
        <h3
          className="
            text-sm
            font-black
            text-slate-900
          "
        >
          Pilih nominal dukungan
        </h3>

        <p
          className="
            mt-1
            text-[10px]
            leading-4
            text-slate-500
          "
        >
          Anda dapat memilih nominal cepat
          atau memasukkan nominal sendiri.
        </p>
      </div>

      <div
        className="
          mt-3
          grid
          grid-cols-2
          gap-2.5
          sm:grid-cols-4
        "
      >
        {amounts.map(
          (amount) => (
            <DonationAmountCard
              key={amount}
              amount={amount}
              selected={
                selectedAmount ===
                amount
              }
              onSelect={onSelect}
            />
          ),
        )}
      </div>
    </section>
  );
}