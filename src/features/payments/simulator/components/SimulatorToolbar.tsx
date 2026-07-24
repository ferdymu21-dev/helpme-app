interface Props {

    onGenerateIds: () => void;

    onCopyPayload: () => void;

    onCopyResponse: () => void;

}

export default function SimulatorToolbar({

    onGenerateIds,

    onCopyPayload,

    onCopyResponse,

}: Props) {

    return (

        <div
            className="
                flex
                flex-wrap
                gap-3
                border-b
                border-slate-200
                bg-slate-50
                p-4
            "
        >

            <button
                type="button"
                onClick={onGenerateIds}
                className="
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition
                    hover:bg-slate-100
                "
            >
                🔄 Generate New IDs
            </button>

            <button
                type="button"
                onClick={onCopyPayload}
                className="
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition
                    hover:bg-slate-100
                "
            >
                📋 Copy Payload
            </button>

            <button
                type="button"
                onClick={onCopyResponse}
                className="
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition
                    hover:bg-slate-100
                "
            >
                📄 Copy Response
            </button>

        </div>

    );

}