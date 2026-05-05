interface SaveButtonProps {
  saving: boolean;
  onClick: () => void;
  className?: string;
}

export default function SaveButton({
  saving,
  onClick,
  className = "",
}: SaveButtonProps) {
  return (
    <div className="flex justify-center mb-8">
      <button
        onClick={onClick}
        disabled={saving}
        className={`bg-[#ff6633] text-white hover:shadow-[0_4px_12px_rgba(255,102,51,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center rounded cursor-pointer duration-300 px-4 py-2 w-full ${className}`}
      >
        {saving ? "Сохранение..." : "Сохранить расписание"}
      </button>
    </div>
  );
}
