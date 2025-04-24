import { Loader2 } from "lucide-react";

interface LogItemProps {
  date: string;
  content: string;
  loading?: boolean;
}

const LogItem = ({ date, content, loading }: LogItemProps) => {
  return (
    <section className="flex justify-end">
      <div className="flex flex-col items-end gap-2">
        <p className="text-xs text-neutral-400">{date}</p>
        <div className="bg-white p-4 rounded-sm flex flex-col gap-2 justify-end">
          <div className="flex items-center gap-2">
            {loading && (
              <figure>
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </figure>
            )}
            <p>{content}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogItem;
