const NavigationHeader = ({ children }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
      {children}
    </div>
  );
};

export default NavigationHeader;
