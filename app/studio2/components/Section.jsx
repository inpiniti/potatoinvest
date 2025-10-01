const Section = ({ title, description, action, children, className }) => {
  return (
    <div className={`h-64 border rounded-2xl p-4 ${className}`}>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="font-bold text-xl">{title}</div>
          <div className="text-xs text-zinc-400">{description}</div>
        </div>
        <div>{action}</div>
      </div>
      <div>{children}</div>
    </div>
  );
};
export default Section;
